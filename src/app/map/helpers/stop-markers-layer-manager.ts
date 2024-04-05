import { Fill, Icon, Style, Text as TextOl } from 'ol/style';
import { Feature, View } from 'ol';
import { MarkersLayerManager } from './markers-layer-manager';
import { Geometry, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { IStopMarkersConfig } from '../interfaces/ui-config.interface';
import { ILogger } from 'src/app/common/logger/logger.interface';
import { IStop } from 'src/app/features/networkdata/components/stops/interfaces';

export class StopMarkersLayerManager extends MarkersLayerManager<IStop> {
  public readonly stopIdMarkerKey = 'stopId';

  private highlightedStopId?: number;

  constructor(
    private readonly config: IStopMarkersConfig,
    logger: ILogger,
  ) {
    super(logger, 'stop-markers-layer-manager');
  }

  public override addMarker(stop: IStop, view: View, zoom: number): Feature<Geometry> {
    const stopId = this.getStopId(stop);
    const marker = new Feature();
    marker.setGeometry(new Point(fromLonLat([stop.longitude, stop.latitude])));
    marker.setId(`stop-marker-${ stopId }`);
    marker.set(this.stopIdMarkerKey, stopId);
    const stopMarkerStyle = this.createStopMarkerStyle(
      stop,
      view,
      zoom,
      this.config,
      this.isHighlighted(stopId),
    );
    marker.setStyle(stopMarkerStyle);

    this.updateData(stopId, stop, marker);
    //this.logger.debug(() => `Stop marker created. Stop ID: ${ this.getStopId(stop) }`, this.logPrefix);
    return marker;
  }

  public override removeMarker(stop: IStop): void {
    this.removeData(this.getStopId(stop));
    //this.logger.debug(() => `Stop marker removed. Stop ID: ${ this.getStopId(stop) }`, this.logPrefix);
  }

  public override updateAllMarkers(view: View, zoom: number): void {
    try {
      for (const [stopId, marker] of this.modelIdToMarker.entries()) {
        const stop = this.getModel(stopId);
        if (stop) {
          this.updateStopMarker(marker, stop, view, zoom, this.isHighlighted(stopId));
        } else {
          //this.logger.warning(() => `Cannot update marker. Cannot find associated stop. Stop ID: ${ stopId }`, this.logPrefix);
        }
      }
      //this.logger.debug(() => 'Finished updating all stop markers', this.logPrefix);
    } catch (err: any) {
      //this.logger.error(() => `Update of all markers cannot be processed, error occurred:\n${ err?.message }`, this.logPrefix);
    }
  }

  public override updateMarker(stop: IStop, view: View, zoom: number): void {
    const stopId = this.getStopId(stop);
    const marker = this.modelIdToMarker.get(stopId);
    try {
      if (marker) {
        this.updateStopMarker(marker, stop, view, zoom, this.isHighlighted(stopId));
        this.updateData(stopId, stop, marker);
        //this.logger.debug(() => `Stop marker updated. Stop ID: ${ stopId }`, this.logPrefix);
      } else {
        //this.logger.warning(() => `Marker cannot be processed. Marker not exists. Stop ID: ${ stopId }`, this.logPrefix);
      }
    } catch (err: any) {
      //this.logger.error(() => `Marker update cannot be processed, error occurred:\n${ err?.message }.\nStop ID: ${ stopId }`, this.logPrefix);
    }
  }

  public override getMarker(stop: IStop): Feature<Geometry> | undefined {
    return this.modelIdToMarker.get(this.getStopId(stop));
  }

 
  public highlightStop(stop: IStop, view: View, zoom: number): void {
    if (this.highlightedStopId) {
      this.unHighlightStop(view, zoom);
    }

    this.highlightedStopId = this.getStopId(stop);
    this.updateMarker(stop, view, zoom);
  }

  public unHighlightStop(view: View, zoom: number): void {
    const currentlyHighlightedStop = this.highlightedStopId ? this.getModel(this.highlightedStopId) : undefined;
    this.highlightedStopId = undefined;
    if (currentlyHighlightedStop) {
      this.updateMarker(currentlyHighlightedStop, view, zoom);
    }
  }

  private updateStopMarker(marker: Feature, stop: IStop, view: View, zoom: number, isHighlighted: boolean): void {
    const stopMarkerStyle = this.createStopMarkerStyle(stop, view, zoom, this.config, isHighlighted);
    marker.setStyle(stopMarkerStyle);
  }

  private getStopId(stop: IStop): number {
    return stop.primarykeyduid;
  }

  private createStopMarkerStyle(stop: IStop, view: View, zoom: number, config: IStopMarkersConfig, isHighlighted: boolean): Style[] {
    if (this.markerType === 'hidden' || !this.stopInCurrentView(stop, view)) {
      return [this.createNotVisibleMarkerStyle()];
    }
    if (this.markerType === 'generic') {
      const size = this.getGenericMarkerSize(config, zoom);
      const dotMarker = this.createCircleMarkerStyle(config.bgColor, size);
      return isHighlighted ? [this.createMarkerHighlightStyle(size * 7, config.bgColor), dotMarker] : [dotMarker];
    }
    return this.createDetailedStopMarkerStyle(stop, config, isHighlighted);
  }

  private createDetailedStopMarkerStyle(stop: IStop, config: IStopMarkersConfig, isHighlighted: boolean): Style[] {
    const font = '16px Roboto,sans-serif';
    const labelMaxCharsQty = 4;
    const getLabelText = (t: string) => t.length > labelMaxCharsQty ?
      t.slice(0, Math.max(0, labelMaxCharsQty)) + '...' :
      t;

    const boxMarker = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        src: 'assets/icons/stop.svg',
        color: config.bgColor,
      }),
      text: new TextOl({
        textAlign: 'center',
        justify: 'center',
        font,
        offsetY: 1,
        fill: new Fill({ color: config.fontColor }),
        overflow: false,
        text: getLabelText(stop.shortcode),
      }),
    });
    return isHighlighted ? [this.createMarkerHighlightStyle(60 * 2, config.bgColor), boxMarker] : [boxMarker];
  }

  private stopInCurrentView(stop: IStop, view: View): boolean {
    return this.markerInCurrentView(this.getStopId(stop), view);
  }

  private isHighlighted(stopId: number): boolean {
    return this.highlightedStopId === stopId;
  }
  public getHighlightedStop(): IStop | undefined {
    return this.highlightedStopId ? this.getModel(this.highlightedStopId) : undefined;
  }
}
