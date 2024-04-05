import { LineString, Point } from 'ol/geom';
import { Feature, View } from 'ol';
import { fromLonLat } from 'ol/proj';
import { Circle, Fill, Icon, Stroke, Style } from 'ol/style';
import { IPatternMap } from '../interfaces/pattern-map.interface';
import { ILinkMap } from '../interfaces/link-map.interface';
import { ISegment } from '../interfaces/segment.interface';
import { Utils } from 'src/app/shared/utils/utils';
import { CoordinatesView } from 'src/app/features/general-template/model/model';
import { Coordinate } from 'ol/coordinate';
import { IStopPoint } from 'src/app/features/networkdata/components/stops/interfaces/stoppoint.interface';

export class RoutePathManager {
  private readonly patternSegmentIdToFeature = new Map<string, Feature<LineString>>();
  private readonly patternStopSegmentIdToFeature = new Map<string, Feature<Point>>();
  private displayedPattern?: any[];
  public patternstoppointIdMarkerKey = 'patternpointId';
  public showHeading:boolean;
  public patternstopptlist:IStopPoint[]=[];
  private readonly modelIdToName = new Map<string, IStopPoint>();
  public patternLinkIdToFeature = new Map<string, Feature<LineString>>();
  /**
   * Artificially created segment features for the current link (link between stops, on which the vehicle is) -
   * Used in order to be able to mark as traveled only part of the segment
   */
  private currentLinkPatternSegmentFeatures: Feature<LineString>[] = [];

  constructor(
    private readonly pathBaseWidth: number,
    private readonly pathWidthIncreaseFactor: number,
    private readonly noRouteZoomLevel: number,
    private pathCurrentWidth: number,
  ) {
  }

  public getPatternFeatures(): Feature<LineString>[] {
    return Array.from(this.patternSegmentIdToFeature.values()).concat(this.currentLinkPatternSegmentFeatures);
  }
  public getPatternStopFeatures(): Feature<Point>[] {
    return Array.from(this.patternStopSegmentIdToFeature.values());
  }
  public getLinkPatternFeatures(): Feature<LineString>[] {
    return Array.from(this.patternLinkIdToFeature.values());
  }
  public getDisplayedPattern(): any[] | undefined {
    return this.displayedPattern;
  }

  public getModel(modelId: string): IStopPoint | undefined {
    return this.modelIdToName.get(modelId);
  }

  public updatePatternSegmentFeatures(
    pattern: any[],
    remainingPathColor: string,
  ): void {
    this.displayedPattern = pattern;
    this.currentLinkPatternSegmentFeatures = [];
    var prevPattern:any;
    for(var i=0;i<pattern.length;i++)
    {
      if(i>0)
      {
        const feature = this.getPatternSegmentFeature(prevPattern, pattern[i]);
          if (feature) {
            feature.setStyle(this.getSegmentStyle(remainingPathColor));
          }
      }
      prevPattern=pattern[i];
    }
  }

  public createPatternSegmentFeatures(
    pattern: any[],
    remainingPathColor: string,
  ): void {
    this.displayedPattern = pattern;
    this.clearPatternSegmentFeatures();
    var prevPattern:any;
    var coordinateList: number[][] = [];
    var segmentId:string;
    for(var i=0;i<pattern.length;i++)
    {
      const currentCoordinate = fromLonLat([pattern[i].longitude, pattern[i].latitude]);
      coordinateList.push(currentCoordinate);
      segmentId = [pattern[i].patternindex, pattern[i].stoppingpoint].join('-');
      if(i>0)
      {
        this.addPatternSegmentFeature(prevPattern, pattern[i], remainingPathColor);   
        var shapepoints:any[] = pattern[i].patternsegmentshapes;
        this.addLinkshapepointFeature(pattern[i].patternindex,pattern[i].prevlinkindex,shapepoints, "#3B9EBF")
      }
      prevPattern=pattern[i];

      const vertex = new Point(currentCoordinate);
      const vertexFeature = new Feature(vertex);
      var currentStopPoint = this.patternstopptlist.filter(item1 => pattern[i]['stoppingpoint'] === item1['netzpunktindex']);
      var compassvalue =0;
      if(currentStopPoint)
      {
        compassvalue =currentStopPoint[0].gpskompassrichtung;
        this.modelIdToName.set(segmentId, currentStopPoint[0]);
      }
      const style = this.createGenericStopPointMarkerStyle(compassvalue);
      vertexFeature.setId(segmentId);
      vertexFeature.set(this.patternstoppointIdMarkerKey, segmentId );
      vertexFeature.setStyle(style);
      this.patternStopSegmentIdToFeature.set(segmentId, vertexFeature);
      
    }
    // const feature = new Feature<LineString>();
    // feature.setGeometry(new LineString(coordinateList));
    // feature.setStyle(this.getSegmentStyle(remainingPathColor));
    // this.patternSegmentIdToFeature.set(segmentId, feature);      
  }

  private createGenericStopPointMarkerStyle(compassValue?:number): Style[] {
    
    var rotationValue = compassValue? compassValue * (Math.PI/180.0):0;
    const getArrow = () => {
      return new Style({
        image: new Icon({
          anchor: [0.5, 1.0],
          rotateWithView: true,
          rotation: rotationValue,
          color:"red",
          src: 'assets/icons/arrow_up.svg',
        }),
      });
    };

    const createcircle=()=>{
      return new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({ color: 'blue' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      });
    };
    let styles = [];
    styles = [...styles, createcircle()];
    if(this.showHeading)
      styles = [...styles, getArrow()];
    return styles;
  }
  public changePathSegmentsWidth(zoom: number): boolean {
    const newSegmentsWidth = this.calculatePathSegmentsWidth(zoom);
    if (newSegmentsWidth !== this.pathCurrentWidth) {
      this.pathCurrentWidth = newSegmentsWidth;
      this.updatePatternSegmentsFeatureWidth(this.pathCurrentWidth);
      return true;
    }
    return false;
  }

  public getPathSegmentsWidth(): number {
    return this.pathCurrentWidth;
  }

  public clearAllPatternPathData(): void {
    this.displayedPattern = undefined;
    this.clearPatternSegmentFeatures();
  }

  private clearPatternSegmentFeatures(): void {
    this.patternSegmentIdToFeature.clear();
    this.currentLinkPatternSegmentFeatures = [];
    this.patternStopSegmentIdToFeature.clear();
    this.modelIdToName.clear();
    this.patternLinkIdToFeature.clear();
  }

  private calculatePathSegmentsWidth(zoom: number): number {
    if (zoom > this.noRouteZoomLevel) {
      const width = this.pathBaseWidth + (zoom - (this.noRouteZoomLevel + 1)) * this.pathWidthIncreaseFactor;
      return Math.max(1, width);
    }
    // Cannot use just 0 as it's treated by the OpenLayer library in the same way as undefined,
    // and then some default value is used instead
    return 0.01;
  }

  private updatePatternSegmentsFeatureWidth(width: number): void {
    this.getPatternFeatures().forEach(p => {
      const style = p.getStyle();
      if (style && style instanceof Style) {
        const stroke = style.getStroke();
        if (stroke) {
          stroke.setWidth(width);
        }
      }
    });
  }
  private addLinkshapepointFeature(patternIndex:number,linkIndex:any,shapepoint:any[], color: string): void {
    const segmentId = this.getLinkShapepointId(patternIndex, linkIndex);
    const feature = this.createShapepointFeature(shapepoint, color);
    this.patternLinkIdToFeature.set(segmentId, feature);
  }
  private createShapepointFeature(shapepoint:any[],color: string): Feature<LineString> {
    const feature = new Feature<LineString>();
    var coordinates:Coordinate[]=[];
    for(var i=0;i<shapepoint.length;i++)
    {
     var coordinateA = fromLonLat([shapepoint[i].CoordinateX, shapepoint[i].CoordinateY]);
     coordinates.push(coordinateA);
    }
    feature.setGeometry(new LineString(coordinates));
    feature.setStyle(this.getShapeSegmentStyle(color));
    return feature;
  }

  private addPatternSegmentFeature(prevPattern:any,currPattern:any, color: string): void {
    const segmentId = this.getPatternSegmentId(prevPattern, currPattern);
    const feature = this.createSegmentFeature(prevPattern, currPattern, color);
    this.patternSegmentIdToFeature.set(segmentId, feature);
  }

  private createSegmentFeature(prevPattern:any,currPattern:any,color: string): Feature<LineString> {
    const feature = new Feature<LineString>();
    const coordinateA = fromLonLat([prevPattern.longitude, prevPattern.latitude]);
    const coordinateB = fromLonLat([currPattern.longitude, currPattern.latitude]);
    feature.setGeometry(new LineString([coordinateA, coordinateB]));
    feature.setStyle(this.getSegmentStyle(color));
    return feature;
  }

  private getSegmentStyle(color: string): Style {
    return new Style({
      stroke: new Stroke({
        color,
        width: this.pathCurrentWidth,
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({ color: 'blue' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
    });
  }
  private getShapeSegmentStyle(color: string): Style {
    return new Style({
      stroke: new Stroke({
        color,
        width: 3,
      })
    });
  }
  /**
   * @param size Size of the marker
   * @param borderWidthPercents Width of the border in percents <0-1>
   * @protected
   */
  protected getCircleMarkerImage(size: number, borderWidthPercents = 0.30): string {
    const outerCircleRadius = 50;
    const innerCircleRadius = outerCircleRadius * (1 - Utils.clamp(borderWidthPercents, 0, 1));
    const svgPath = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg">\n' +
      '<circle cx="50%" cy="50%" r="' + outerCircleRadius + '%" fill="#9e9e9e"/>' +
      '<circle cx="50%" cy="50%" r="' + innerCircleRadius + '%" fill="white"/>' +
      '</svg>';
    return 'data:image/svg+xml;base64,' + btoa(svgPath);
  }
  private getPatternSegmentId(prevPattern:any,currPattern:any): string {
    return [prevPattern.patternindex, prevPattern.stoppingpointname, currPattern.stoppingpointname].join('-');
  }
  private getLinkShapepointId(patternIndex:number,linkIndex:any): string {
    return [patternIndex,linkIndex].join('-');
  }
  private getPatternSegmentFeature(prevPattern:any,currPattern:any): Feature<LineString> | undefined {
    const segmentId = this.getPatternSegmentId(prevPattern, currPattern);
    return this.patternSegmentIdToFeature.get(segmentId);
  }
  private getLinkShapepointFeature(patternIndex:number,linkIndex:any): Feature<LineString> | undefined {
    const segmentId = this.getLinkShapepointId(patternIndex, linkIndex);
    return this.patternLinkIdToFeature.get(segmentId);
  }
  // private getCurrentLinkPatternSegmentFeatures(
  //   segments: ISegment[],
  //   traveledDistanceFromLastStopMeters: number,
  //   traveledPathColor: string,
  //   remainingPathColor: string,
  // ): Feature<LineString>[] {
  //   let segmentsSumLengthMeters = 0;
  //   const featuresList: Feature<LineString>[] = [];
  //   let i = 0;
  //   while (i < segments.length && segmentsSumLengthMeters <= traveledDistanceFromLastStopMeters) {
  //     const segment = segments[i];
  //     const feature = this.createSegmentFeature(segment, remainingPathColor);
  //     const segmentLengthMeters = this.getLengthInMeters(feature);
  //     segmentsSumLengthMeters += segmentLengthMeters;

  //     if (segmentsSumLengthMeters <= traveledDistanceFromLastStopMeters) {
  //       feature.setStyle(this.getSegmentStyle(traveledPathColor));
  //       featuresList.push(feature);
  //     } else {
  //       const remainingSegmentLengthMeters = Utils.clamp(
  //         segmentsSumLengthMeters - traveledDistanceFromLastStopMeters,
  //         0,
  //         segmentsSumLengthMeters,
  //       );
  //       const splitLengthPercent = (segmentLengthMeters - remainingSegmentLengthMeters) / segmentLengthMeters;
  //       const splitSegmentFeatures = this.splitSegmentFeature(segment, splitLengthPercent, traveledPathColor, remainingPathColor);
  //       featuresList.push(...splitSegmentFeatures);
  //     }
  //     i++;
  //   }

  //   for (let j = i; j < segments.length; j++) {
  //     const segment = segments[j];
  //     const feature = this.createSegmentFeature(segment, remainingPathColor);
  //     featuresList.push(feature);
  //   }

  //   return featuresList;
  // }

  /**
   * @param segment Segment to split
   * @param splitLengthPercent Length of the first element after split (in percent <0.0-1.0>)
   * @param traveledPathColor Color of the traveled part of the path
   * @param remainingPathColor Color of the remaining part of the path
   * @private
   */
  // private splitSegmentFeature(
  //   segment: ISegment,
  //   splitLengthPercent: number,
  //   traveledPathColor: string,
  //   remainingPathColor: string,
  // ): Feature<LineString>[] {
  //   const startPoint = segment.pointA;
  //   const endPoint = segment.pointB;

  //   const splitPointCoords = this.calculateSplitPointCoords(startPoint, endPoint, splitLengthPercent);
  //   const splitPoint: CoordinatesView = { lon: splitPointCoords.lon, lat: splitPointCoords.lat };

  //   const fstSegment: ISegment = { pointA: startPoint, pointB: splitPoint };
  //   const fstFeature = this.createSegmentFeature(fstSegment, traveledPathColor);

  //   const sndSegment: ISegment = { pointA: splitPoint, pointB: endPoint };
  //   const sndFeature = this.createSegmentFeature(sndSegment, remainingPathColor);

  //   return [fstFeature, sndFeature];
  // }

  /**
   * @param start Start point of segment to split
   * @param end End point of segment to split
   * @param splitLengthPercent Length of the first element after split (in percent <0.0-1.0>)
   * @private
   */
  private calculateSplitPointCoords(start: CoordinatesView, end: CoordinatesView, splitLengthPercent: number): CoordinatesView {
    const lat = start.lat + ((end.lat - start.lat) * splitLengthPercent);
    const lon = start.lon + ((end.lon - start.lon) * splitLengthPercent);
    return { lat, lon };
  };

  private getLengthInMeters(feature: Feature<LineString>): number {
    const lineString = feature.getGeometry();
    if (lineString) {
      return lineString.getLength();
    }
    return 0;
  }
  public updateAllStopPointMarkers(view: View, zoom: number): void {
    try {
      for (const [stoppointId, marker] of this.patternStopSegmentIdToFeature.entries()) {
        const stoppoint = this.getModel(stoppointId);
        if (stoppoint) {
          this.updateStopPointMarker( marker,stoppoint.gpskompassrichtung);
        } 
      }
    } catch (err: any) {
      //this.logger.error(() => `Update of all markers cannot be processed, error occurred:\n${ err?.message }`, this.logPrefix);
    }
  }
  private updateStopPointMarker(marker: Feature,compassValue?:number): void {
    const markerStyle = this.createGenericStopPointMarkerStyle(compassValue);
      marker.setStyle(markerStyle);     
  }
}
