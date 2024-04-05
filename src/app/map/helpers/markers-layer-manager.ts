import { Feature, View } from 'ol';
import { Geometry } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import { MarkerType } from '../types/marker-type';
import { IMarkerSizeConfig } from '../interfaces/ui-config.interface';
import { ILogger } from 'src/app/common/logger/logger.interface';
import { Utils } from 'src/app/shared/utils/utils';

export abstract class MarkersLayerManager<T> {
  protected readonly modelIdToMarker = new Map<number, Feature<Geometry>>();
  private readonly modelIdToModel = new Map<number, T>();
  private _markerType: MarkerType = 'hidden';

  constructor( protected readonly logger: ILogger,protected readonly logPrefix: string) {
  }

  public clearMarkers(): void {
    this.modelIdToMarker.clear();
    this.modelIdToModel.clear();
  }

  public getAllMarkers() {
    return Array.from(this.modelIdToMarker.values());
  }

  public get markerType(): MarkerType {
    return this._markerType;
  }

  public updateMarkersType(currentZoom: number, markerSizeConfig: IMarkerSizeConfig): void {
    const prevType = this._markerType;
    this._markerType = this.calculateMarkersType(currentZoom, markerSizeConfig);
    //this.logger.debug(() => `Markers type updated. Previous: ${ prevType }. Current: ${ this._markerType }`, this.logPrefix);
  }

  public abstract addMarker(model: T, view: View, zoom: number): Feature<Geometry> | undefined;

  public abstract updateAllMarkers(view: View, zoom: number): void;

  public abstract updateMarker(model: T, view: View, zoom: number): void;

  public abstract removeMarker(model: T): void;

  public abstract getMarker(model: T): Feature<Geometry> | undefined;

  public getModel(modelId: number): T | undefined {
    return this.modelIdToModel.get(modelId);
  }
  
  protected updateData(modelId: number, model: T, marker: Feature<Geometry>): void {
    this.modelIdToModel.set(modelId, model);
    this.modelIdToMarker.set(modelId, marker);
  }

  protected removeData(modelId: number): void {
    this.modelIdToModel.delete(modelId);
    this.modelIdToMarker.delete(modelId);
  }

  protected markerInCurrentView(modelId: number, view: View): boolean {
    const extent = view.calculateExtent();
    const marker = this.modelIdToMarker.get(modelId);
    return !!(marker && marker.getGeometry()?.intersectsExtent(extent));
  }

  protected createCircleMarkerStyle(color: string, size: number): Style {
    return new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        color,
        src: this.getCircleMarkerImage(size),
      }),
    });
  }

  protected createNotVisibleMarkerStyle(): Style {
    return new Style();
  }

  protected getGenericMarkerSize(markerSizeConfig: IMarkerSizeConfig, zoom: number): number {
    const baseSize = markerSizeConfig.genericMarkerSize;
    const noMarkersZoomLevel = markerSizeConfig.noMarkersZoomLevel;
    const increaseFactor = markerSizeConfig.genericMarkerSizeIncreaseFactor;
    return baseSize + (zoom - (noMarkersZoomLevel + 1)) * increaseFactor;
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

  protected createMarkerHighlightStyle(size: number, color: string, displacementY = 0): Style {
    return new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        opacity: 0.4,
        anchorYUnits: 'fraction',
        displacement: [0, displacementY ?? 0],
        color,
        src: this.getCircleMarkerImage(size, 0.05),
      }),
    });
  }

  private calculateMarkersType(currentZoom: number, markerSizeConfig: IMarkerSizeConfig): MarkerType {
    if (currentZoom <= markerSizeConfig.noMarkersZoomLevel) {
      return 'hidden';
    }

    if (currentZoom <= markerSizeConfig.genericMarkersZoomLevel) {
      return 'generic';
    }

    return 'detailed';
  }
}
