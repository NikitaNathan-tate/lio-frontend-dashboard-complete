import { Fill, Icon, Style, Text as TextOl } from 'ol/style';
import { Feature, View } from 'ol';
import { MarkersLayerManager } from './markers-layer-manager';
import { Geometry, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { IStopPoint } from 'src/app/features/networkdata/components/stops/interfaces/stoppoint.interface';
import { IStopPointMarkersConfig } from '../interfaces/ui-config.interface';
import { ILogger } from 'src/app/common/logger/logger.interface';

export class StopPointMarkersLayerManager extends MarkersLayerManager<IStopPoint> {
  public stoppointIdMarkerKey = 'stoppointId';
  public stoppointIdMarkerId = 'stoppoint-marker';

  private highlightedStopPointId?: number;
  public showHeading:boolean;

  constructor(
    private readonly config: IStopPointMarkersConfig,
    logger: ILogger,
    private readonly zIndexBase: number,
  ) {
    super(logger, 'stoppoint-markers-layer-manager');
  }

  public UpdatePatternStopId()
  {
    this.stoppointIdMarkerKey = 'patternstoppointId';
    this.stoppointIdMarkerId ='patternstoppoint-marker';
  }
  public override updateMarker(stoppoint: IStopPoint, view: View, zoom: number): void {
    const stoppointId = StopPointMarkersLayerManager.getStopPointId(stoppoint);
    const marker = this.modelIdToMarker.get(stoppointId);
    try {
      if (marker) {
        this.updateStopPointMarker(stoppoint, marker, view, zoom);
        this.updateData(stoppointId, stoppoint, marker);
        //this.logger.debug(() => `StopPoint marker updated. Stop ID: ${ stoppointId }`, this.logPrefix);
      } else {
       // this.logger.warning(() => `Marker cannot be processed. Marker not exists. Stop ID: ${ stoppointId }`, this.logPrefix);
      }
    } catch (err: any) {
      //this.logger.error(() => `Marker update cannot be processed, error occurred:\n${ err?.message }.\StopPoint ID: ${ stoppointId }`, this.logPrefix);
    }
  }

  public override updateAllMarkers(view: View, zoom: number): void {
    try {
      for (const [stoppointId, marker] of this.modelIdToMarker.entries()) {
        const stoppoint = this.getModel(stoppointId);
        if (stoppoint) {
          this.updateStopPointMarker(stoppoint, marker, view, zoom);
        } else {
          //this.logger.error(() => `Cannot update marker. Cannot find associated stoppoint. StopPoint ID: ${ stoppointId }`, this.logPrefix);
        }
      }
      //this.logger.debug(() => 'Finished updating all stoppoint markers', this.logPrefix);
    } catch (err: any) {
      //this.logger.error(() => `Update of all markers cannot be processed, error occurred:\n${ err?.message }`, this.logPrefix);
    }
  }

  public override addMarker(stoppoint: IStopPoint, view: View, zoom: number): Feature<Geometry> | undefined {
    if (stoppoint.longitude && stoppoint.latitude) {
      const stoppointId = StopPointMarkersLayerManager.getStopPointId(stoppoint);
      const marker = new Feature();
      marker.setGeometry(new Point(fromLonLat([stoppoint.longitude, stoppoint.latitude])));
      marker.setId(`${this.stoppointIdMarkerId}-${ stoppointId }`);
      marker.set(this.stoppointIdMarkerKey, stoppointId);
      const color = this.config.bgColor;
      const markerStyle = this.createStopPointMarkerStyle(stoppoint, view, zoom, this.config, color);
      marker.setStyle(markerStyle);

      this.updateData(stoppointId, stoppoint, marker);
      //this.logger.debug(() => `Stoppoint marker created. stoppoint ID: ${ StopPointMarkersLayerManager.getStopPointId(stoppoint) }`, this.logPrefix);
      return marker;
    }

    // this.logger.warning(
    //   () => `stoppoint with ID: ${ StopPointMarkersLayerManager.getStopPointId(stoppoint) } not displayed. Undefined coords (lat=${ stoppoint.latitude }, long=${ stoppoint.longitude })`,
    //   this.logPrefix,
    // );
    return undefined;
  }

  public override getMarker(stoppoint: IStopPoint): Feature<Geometry> | undefined {
    return this.modelIdToMarker.get(StopPointMarkersLayerManager.getStopPointId(stoppoint));
  }

  public override removeMarker(stoppoint: IStopPoint): void {
    this.removeData(StopPointMarkersLayerManager.getStopPointId(stoppoint));
    //this.logger.debug(() => `StopPoint marker removed. stoppoint ID: ${ StopPointMarkersLayerManager.getStopPointId(stoppoint) }`, this.logPrefix);
  }

  public highlightStopPoint(stoppoint: IStopPoint, view: View, zoom: number): void {
    
    // Unhighlight previously highlighted stoppoint
    if (this.highlightedStopPointId) {
      this.unHighlightStopPoint(view, zoom);
    }

    this.highlightedStopPointId = StopPointMarkersLayerManager.getStopPointId(stoppoint);;
    this.updateMarker(stoppoint, view, zoom);
  }

  public unHighlightStopPoint(view: View, zoom: number): void {
    const currentlyHighlightedStopPoint = this.highlightedStopPointId ? this.getModel(this.highlightedStopPointId) : undefined;
    this.highlightedStopPointId = undefined;
    if (currentlyHighlightedStopPoint) {
      this.updateMarker(currentlyHighlightedStopPoint, view, zoom);
    }
  }

  public isHighlighted(stoppointId: number): boolean {
    return this.highlightedStopPointId === stoppointId;
  }

  public static getStopPointId(stoppoint: IStopPoint): number {
    return stoppoint.primarykeyduid;
  }

  public getHighlightedStopPoint(): IStopPoint | undefined {
    return this.highlightedStopPointId ? this.getModel(this.highlightedStopPointId) : undefined;
  }

  private updateStopPointMarker(stoppoint: IStopPoint, marker: Feature, view: View, zoom: number): boolean {
    if (stoppoint.longitude && stoppoint.latitude) {
      const stopPoint = marker.getGeometry() as Point;
      stopPoint.setCoordinates(fromLonLat([stoppoint.longitude, stoppoint.latitude]));
      const color = this.config.bgColor;
      const markerStyle = this.createStopPointMarkerStyle(stoppoint, view, zoom, this.config, color);
      marker.setStyle(markerStyle);
      return true;
    }
    // this.logger.warning(
    //   () => `Marker not updated. Stop point ID: ${ StopPointMarkersLayerManager.getStopPointId(stoppoint) }. Undefined coords (lat=${ stoppoint.latitude }, long=${ stoppoint.longitude })`,
    //   this.logPrefix,
    // );
    return false;
  }

  private createStopPointMarkerStyle(
    stoppoint: IStopPoint,
    view: View,
    zoom: number,
    config: IStopPointMarkersConfig,
    color: string,
  ): Style | Style[] {
    if (this.markerType === 'hidden' || !this.stoppointInCurrentView(stoppoint, view)) {
      return this.createNotVisibleMarkerStyle();
    }

    const highlighted = this.highlightedStopPointId === StopPointMarkersLayerManager.getStopPointId(stoppoint);

    if (this.markerType === 'generic') {
      const size = this.getGenericMarkerSize(config, zoom);
      return this.createGenericStopPointMarkerStyle(color, size, highlighted,stoppoint.gpskompassrichtung);
    }

    let textList =  [stoppoint.stopname+'('+stoppoint.stoppointnumber+')'];
    return this.createDetailedStopPointMarkerStyle(color, textList, parseInt(stoppoint.primarykeyduid+'', 10) || 1, config, highlighted,stoppoint.gpskompassrichtung);
  }

  private createGenericStopPointMarkerStyle(color: string, size: number, highlighted: boolean,compassValue?:number): Style[] {
    const getHighlight = () => {
      return this.createMarkerHighlightStyle(size * 7, color);
    };

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

    let styles = highlighted ? [getHighlight()] : [];
    styles = [...styles, this.createCircleMarkerStyle(color, size)];
    if(this.showHeading)
      styles = [...styles, getArrow()];
    return styles;
  }

  private createDetailedStopPointMarkerStyle(
    color: string,
    textList: string[],
    index: number,
    config: IStopPointMarkersConfig,
    highlighted: boolean,
    compassValue?:number,
  ): Style[] {
    type MarkerType = 'one-line' | 'two-lines' | 'three-lines';
    const dotSize = 10;
    const labelMaxCharsQty = 8;
    const boxWidth = 100; // Should match width from the svg file

    const getMarkerType = (labelsList: string[]): MarkerType => {
      if (labelsList.length >= 3) {
        return 'three-lines';
      } else if (labelsList.length >= 2) {
        return 'two-lines';
      }
      return 'one-line';
    };

    const getBoxText = (labelsList: string[]): string => {
      return labelsList
        .map(t => t.length > labelMaxCharsQty ?
          t.slice(0, Math.max(0, labelMaxCharsQty - 1)) + '...' :
          t,
        )
        .join('\n');
    };

    const getMarker = (textOffsetY: number, markerDisplacementY: number, iconName: string) => {
      const fontColor = '#fafafa';
      const zIndex = this.zIndexBase + index; // Fix for labels overlapping (https://github.com/googlemaps/v3-utility-library/issues/375)
      const font = `${ config.labelFontSizePx || 16 }px Roboto,sans-serif`;

      return new Style({
        zIndex,
        image: new Icon({
          width: boxWidth,
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          displacement: [0, markerDisplacementY],
          color,
          src: 'assets/icons/' + iconName,
        }),
        text: new TextOl({
          textAlign: 'center',
          justify: 'center',
          offsetY: textOffsetY - markerDisplacementY,
          font,
          fill: new Fill({ color: fontColor }),
          overflow: false,
          text: getBoxText(textList),
        }),
      });
    };

    const getBox = () => {
      const markerType = getMarkerType(textList);
      const textOffsetY = getBoxCenterYDisplacement(markerType) * -1;
      if (markerType === 'three-lines') {
        return getMarker(textOffsetY, dotSize, 'stoppoint-detailed-marker-three-lines.svg');
      }
      if (markerType === 'two-lines') {
        return getMarker(textOffsetY, dotSize, 'stoppoint-detailed-marker-two-lines.svg');
      }
      return getMarker(textOffsetY, dotSize, 'stoppoint-detailed-marker.svg');
    };

    const getBoxCenterYDisplacement = (markerType: MarkerType) => {
      if (markerType === 'three-lines') {
        return 41;
      }
      if (markerType === 'two-lines') {
        return 31;
      }
      return 20;
    };

    const getDot = () => {
      return new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          color,
          src: this.getCircleMarkerImage(dotSize),
        }),
      });
    };

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

    const getHighlight = () => {
      const size = boxWidth * 1.5;
      const displacement = getBoxCenterYDisplacement(getMarkerType(textList));
      return this.createMarkerHighlightStyle(size, color, displacement);
    };

    let styles = highlighted ? [getHighlight()] : [];
    styles = [...styles, getBox(), getDot()];
    if(this.showHeading)
      styles = [...styles, getArrow()];
    return styles;
  }

  private stoppointInCurrentView(stoppoint: IStopPoint, view: View): boolean {
    return this.markerInCurrentView(StopPointMarkersLayerManager.getStopPointId(stoppoint), view);
  }
}
