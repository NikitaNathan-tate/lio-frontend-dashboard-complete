import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Feature, Map as OlMap, MapBrowserEvent, View } from 'ol';
import { OSM, TileArcGISRest, TileWMS, XYZ } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import Controls from 'ol/control/Control'
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Modify,  Select,  Snap,  defaults as defaultInteractions} from 'ol/interaction.js';
import { Zoom } from '../../enums/zoom.enum';
import { OverviewMap } from 'ol/control.js';
import BaseLayer from 'ol/layer/Base';
import { IMapConfig, IMapTilesConfig, IRoutePathConfig, IStopMarkersConfig, IStopPointMarkersConfig } from '../../interfaces/ui-config.interface';
import { fromLonLat } from 'ol/proj.js';
import LayerGroup from 'ol/layer/Group';
import VectorLayer from 'ol/layer/Vector';
import { StopMarkersLayerManager } from '../../helpers/stop-markers-layer-manager';
import { ILogger } from 'src/app/common/logger/logger.interface';
import { Subscription, forkJoin, fromEvent } from 'rxjs';
import { IStop } from 'src/app/features/networkdata/components/stops/interfaces';
import { IResolveMapData } from '../../interfaces/resolve-map-data.interface';
import { ActivatedRoute } from '@angular/router';
import { Point } from 'ol/geom';
import VectorSource from 'ol/source/Vector';
import { StoplistService } from 'src/app/features/networkdata/components/stops/services';
import { FeatureLike } from 'ol/Feature';
import { Utils } from 'src/app/shared/utils/utils';
import { StoppointlistService } from 'src/app/features/networkdata/components/stops/services/stoppointlist.service';
import { IStopPoint } from 'src/app/features/networkdata/components/stops/interfaces/stoppoint.interface';
import { StopPointMarkersLayerManager } from '../../helpers/stoppoint-markers-layer-manager';
import { StoppingPoint } from 'src/app/features/general-template/model/model';
import { IPatternMap } from '../../interfaces/pattern-map.interface';
import { RoutePathManager } from '../../helpers/route-path-manager';
import { boundingExtent } from 'ol/extent';
import { PatternlistService } from 'src/app/features/networkdata/components/stops/services/patternlist.service';
import { AppConfig } from 'src/app/AppConfig.service';
import { DataService } from 'src/app/data.service';
import { Coordinate } from 'ol/coordinate';
import { HttpClient } from '@angular/common/http';
interface MapItem {
  text: string;
  value: number;
}
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['../../../../../node_modules/ol/ol.css', './map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: '0' })),
      transition(':enter', animate('100ms ease-out')),
    ]),
    trigger('fadeOut', [
      state('void', style({ opacity: '0' })),
      transition(':leave', animate('100ms ease-out')),
    ]),
  ],
})
export class MapComponent implements OnInit {

  public readonly ZoomOl = Zoom;
  public map!: OlMap;
  public initialized = false;
  public dataFetched = false;
  public showDragAndDropOverlay = false;
  public showHeading = false;
  public editPattern = false;
  @Input() public mapConfig!: IMapConfig;

  @ViewChild('map', { static: true }) private mapElementRef!: ElementRef<HTMLDivElement>;
  private readonly stopsLayerZindex = 2;
  private readonly stoppointsLayerZindex = 3;
  private readonly patternstopptsLayerZindex = 4;
  private readonly logPrefix = 'Map Component';
  private readonly cacheSize = 50 * 1024;
  private readonly attribution = 'Trapeze Group';
  private readonly defaultWmsEndpoint = 'geoserver/wms';
  private readonly defaultTmsEndpoint = 'geoserver/gwc/service/tms/1.0.0/ws_geoserver_map_db:dcg2_layer_group@pbf/{z}/{x}/{-y}.pbf';
  private readonly defaultXyzEndpoint = 'tiles/{z}/{x}/{y}.png';
  private dataSubscription = new Subscription();
  private mapEventsSubscription = new Subscription();
  private readonly layerGroup = new LayerGroup();
  private stopMarkersLayer?: VectorLayer<any>;
  private stopsMarkersLayerManager!: StopMarkersLayerManager;
  private stoppointMarkersLayer?: VectorLayer<any>;
  private segmentsLayer!: VectorLayer<any>;
  private stoppointsMarkersLayerManager!: StopPointMarkersLayerManager;
  private routePathManager!: RoutePathManager;
  private logger: ILogger;
  private baseLayer:BaseLayer;
  public listItems: Array<string> = [
    "Stops",
    "Stopping Points",
    "Patterns",
  ];
  public value: any;
  public allowCustom = true;
  public selectedValues: MapItem = {text:"Open Street Map", value:1};
  public maplist: Array<MapItem> = [
    { text: "Open Street Map", value: 1 },
    { text: "Open Street Map Öffentlicher Verkehr", value: 2 },
    { text: "ARC Satelliten Karte", value: 3 },
    { text: "ARC Strassen Karte", value: 4 },
    { text: "ARC topographische Karte", value: 5 }
  ];
  public mouseoverStopPoint: IStopPoint | undefined;
  public mouseoverPatternStopPoint: IStopPoint | undefined;
  private patternList:any[];
  private selectedPatternId:number;
  public stoppointList:IStopPoint[]=[];
  public stopList:IStop[]=[];
  private select:any; 
  private vectorSourcePattern: VectorSource;
  private vectorSourceStopPoint: VectorSource;
  private dragInteraction: Modify;
  private dragStopPointInteraction: Modify;
  private contextMenu: HTMLDivElement;
  variableTopHeight: any;
  variableLeftHeight: any;
  showcontextmenu:boolean;
  private oldCoordinates:Coordinate;
  private newCoordinates:Coordinate;
  public constructor( private readonly cdr: ChangeDetectorRef,
    private route: ActivatedRoute,private stopListService : StoplistService, private dataService: DataService,
    private stoppointListService:StoppointlistService,private http: HttpClient
  ) {
  }
  ngOnInit(): void {
    this.select = new Select({
      
    });
    this.showcontextmenu = true;
    this.vectorSourcePattern = new VectorSource;
    this.vectorSourceStopPoint = new VectorSource;
    this.stopsMarkersLayerManager = new StopMarkersLayerManager(this.stopMarkersConfig, this.logger);
    this.stoppointsMarkersLayerManager = new StopPointMarkersLayerManager(
      this.stoppointMarkersConfig,
      this.logger,
      this.stoppointsLayerZindex,);
      this.routePathManager = new RoutePathManager(
        this.routePathConfig.pathBaseWidth,
        this.routePathConfig.pathWidthIncreaseFactor,
        this.routePathConfig.noRouteZoomLevel,
        this.routePathConfig.pathBaseWidth,
      );
    this.initialize();
 }
 public ngAfterViewInit(): void {
  this.variableTopHeight = "0px";
  this.variableLeftHeight="0px";
  this.showcontextmenu = false;
  this.updateMapSize();
  this.fetchData();
  this.map.addLayer(this.segmentsLayer);
  //this.map.addLayer(this.patternstopptMarkersLayer);
  //this.observeStopsUpdates();
  //this.observeStopsRemoves();
  this.observeMapEvents();
}
 private initialize(): void {
  this.buildMap();
  this.map.addLayer(this.layerGroup);  
  this.stopMarkersLayer = this.getStopMarkersLayer([]);
  this.stoppointMarkersLayer = this.getStopPointMarkersLayer([]);  
  this.segmentsLayer = new VectorLayer({
    updateWhileAnimating: true,
    updateWhileInteracting:false,
    source: this.vectorSourcePattern,
  });
  this.initialized = true;
}
private buildMap(): void {
  this.getMapTileLayer();
  const overviewMap = new OverviewMap({
    collapsed: false,
    collapsible: false,
    layers: [this.baseLayer],
  });
  this.map = new OlMap({
    interactions: defaultInteractions().extend([this.select]),
    controls: [overviewMap],
    layers: [],
    target: this.mapElementRef.nativeElement,
    view: new View({
      enableRotation: true,
      constrainResolution: true,
      center: fromLonLat([this.mapConfig.defaultCoordinates.longitude, this.mapConfig.defaultCoordinates.latitude]),
      zoom: this.mapConfig.zoom,
      minZoom: this.mapConfig.minZoom,
      maxZoom: this.mapConfig.maxZoom,
    }),
  });
  this.map.addControl(overviewMap);
  this.dragInteraction = new Modify({
    source: this.vectorSourcePattern,
  });
  this.addModifyStartEvents(this.dragInteraction);
  this.addModifyLineEndEvents(this.dragInteraction);
  this.dragStopPointInteraction = new Modify({
    source: this.vectorSourceStopPoint,
  });
  this.addModifyStartEvents(this.dragStopPointInteraction);
  this.addModifyPointEndEvents(this.dragStopPointInteraction);
  const snap = new Snap({ source: new VectorSource });
    this.map.addInteraction(snap);
  this.buildTileLayers();
  //this.buildContextMenu();
}
private addModifyStartEvents(modify:Modify)
{  
    modify.on('modifystart', (e) => {
      let oldPoints = e.features
      .item(0)
      .getGeometry()
      .clone();
      let oldPoint: Point = <Point>e.features
      .item(0)
      .getGeometry()
      .clone();
      this.oldCoordinates = oldPoint.getCoordinates();
    });
  }
  private addModifyLineEndEvents(modify:Modify)
  {
    modify.on('modifyend', (e) => {
      let newPoint: Point = <Point>e.features
        .item(0)
        .getGeometry()
        .clone();
        this.newCoordinates = newPoint.getCoordinates();
      if (this.newCoordinates.length < this.oldCoordinates.length) {
        const removed = this.oldCoordinates.find(
          (coordinate, index) =>
            coordinate[0] !== this.newCoordinates[index][0] &&
            coordinate[1] !== this.newCoordinates[index][1]
        );
        console.log('removed', removed);
      } else if (this.newCoordinates.length > this.oldCoordinates.length) {
        const added = this.newCoordinates.find(
          (coordinate, index) =>
            coordinate[0] !== this.oldCoordinates[index][0] &&
            coordinate[1] !== this.oldCoordinates[index][1]
        );
        console.log('added', added);
      } else {
        let changedFrom;
        changedFrom = this.oldCoordinates;
        var changedTo = this.newCoordinates
        .find((coordinate, index) => {
          changedFrom = this.oldCoordinates[index];
          return (
            coordinate[0] !== changedFrom[0] && coordinate[1] !== changedFrom[1]
          );
        });
        console.log('changed from', changedFrom, 'to', changedTo);
      }
    });
}
private addModifyPointEndEvents(modify:Modify)
  {
    modify.on('modifyend', (e) => {
      let newPoint: Point = <Point>e.features
        .item(0)
        .getGeometry()
        .clone();
        this.newCoordinates = newPoint.getCoordinates();
      if (this.newCoordinates.length < this.oldCoordinates.length) {
        const removed = this.oldCoordinates.find(
          (coordinate, index) =>
            coordinate[0] !== this.newCoordinates[index][0] &&
            coordinate[1] !== this.newCoordinates[index][1]
        );
        console.log('removed', removed);
      } else if (this.newCoordinates.length > this.oldCoordinates.length) {
        const added = this.newCoordinates.find(
          (coordinate, index) =>
            coordinate[0] !== this.oldCoordinates[index][0] &&
            coordinate[1] !== this.oldCoordinates[index][1]
        );
        console.log('added', added);
      } else {
        let changedFrom;
        changedFrom = this.oldCoordinates;
        var changedTo = this.newCoordinates;
        console.log('changed from', changedFrom, 'to', changedTo);
      }
    });
}
private get tilesConfig(): IMapTilesConfig | undefined {
  return this.mapConfig.tilesService;
}
private getMapTileLayer(): BaseLayer {
  if (this.selectedValues==undefined || this.tilesConfig.forceOpenStreetMaps) {
    this.baseLayer=this.getOpenStreetMapLayer();
    return this.baseLayer;
  }

  switch (this.selectedValues.value) {
    case 1: {
      // Build tiles from OSM
      this.baseLayer= this.getOpenStreetMapLayer();
      return this.baseLayer;
    }
    case 2: {
      // Build tiles from URL based on zoom level and x/y coordinates
      this.baseLayer= this.getXYZTileLayer(this.tilesConfig);
      return this.baseLayer;
    }
    case 3: {
      // Build tiles from URL based on ArcGis
      this.baseLayer= this.getArcGisTileLayer("World_Imagery/MapServer");
      return this.baseLayer;
    }
    case 4: {
      // Build tiles from URL based on ArcGis
      this.baseLayer= this.getArcGisTileLayer("World_Street_Map/MapServer");
      return this.baseLayer;
    }
    case 5: {
      // Build tiles from URL based on ArcGis
      this.baseLayer= this.getArcGisTileLayer("World_Topo_Map/MapServer");
      return this.baseLayer;
    }
  }

  return this.getOpenStreetMapLayer();
}
private getXYZTileLayer(tilesConfig: IMapTilesConfig): TileLayer<XYZ> {
  return new TileLayer<XYZ>({
    preload: this.mapConfig.preload,
    source: new XYZ({
      cacheSize: this.cacheSize,
      attributions: this.attribution,
      url: `http://tile.memomaps.de/${ tilesConfig.endpoints.xyz }`,
    }),
  });
}
  private getOpenStreetMapLayer(): TileLayer<OSM> {
    return new TileLayer({
      preload: this.mapConfig.preload,
      source: new OSM({
        attributions: this.attribution,
      }),
    });
  }

  private getArcGisTileLayer(arcString:string): TileLayer<TileArcGISRest> {
    return new TileLayer<TileArcGISRest>({
      preload: this.mapConfig.preload,
      source: new TileArcGISRest({
        params: {
          TRANSPARENT: false,
          TILED: true,
        },
        cacheSize: this.cacheSize,
        attributions: this.attribution,
        url: `http://services.arcgisonline.com/ArcGIS/rest/services/${arcString }`,
      }),
    });
  }
  private buildTileLayers(): void {
    if(this.layerGroup.getLayers().getLength()>0)
      this.layerGroup.getLayers().pop();
    this.layerGroup.getLayers().push(this.getMapTileLayer());
  }
  private get stopMarkersConfig(): IStopMarkersConfig {
    return this.mapConfig.stops;
  }
  private get stoppointMarkersConfig(): IStopPointMarkersConfig {
    return this.mapConfig.stoppoints;
  }
  private updateMapSize(): void {
    window.setTimeout(() => this.map?.updateSize());
  }

  private buildContextMenu():void
  {    
    this.contextMenu = document.createElement('div');
    this.contextMenu.id = "contextMenu"
    this.contextMenu.dir = "ltr";
    this.contextMenu.className = "contextMenu";
    this.contextMenu.style.position = "absolute";
    this.contextMenu.style.left = "0px";
    this.contextMenu.style.top = "0px";
    this.contextMenu.style.display = "none";
    this.map.getViewport().appendChild(this.contextMenu);

    this.contextMenu.innerHTML = 
        '<div id="contextMenuRemove" class="menuItem" (click)="movePoint()"> Move Point </div>';

    this.hideContextMenu();      
  }
  private hideContextMenu() {
    this.contextMenu.style.display = "none";
  }
  private openContextMenu(x, y) 
  {
    x=x+0.7*16;
    y=y+0.7*16+64+32;
    (document.querySelector('.contextMenu') as HTMLElement).style.right = "";
    (document.querySelector('.contextMenu') as HTMLElement).style.bottom = "";
    (document.querySelector('.contextMenu') as HTMLElement).style.left = x + "px";
    (document.querySelector('.contextMenu') as HTMLElement).style.top =  y + "px";
    (document.querySelector('.contextMenu') as HTMLElement).style.display = "block";
    this.cdr.detectChanges();
    // this.contextMenu.style.right = "";
    // this.contextMenu.style.bottom = "";
    // this.contextMenu.style.left = x + "px";
    // this.contextMenu.style.top = y + "px";
    // this.contextMenu.style.display = "block";
  }
  private fetchData(): void {
    this.dataFetched = false;
    const bvNumber = this.mapConfig.bvnumber ;
    this.dataService.bvNumber=bvNumber;
    const dataFetchSubscription = forkJoin([
      this.stopListService.fetchData(bvNumber),
      this.stoppointListService.fetchData(bvNumber),
    ]).subscribe(([stops, stoppoints]) => {
      this.value = [];
      this.stopList = stops;
      this.stoppointList = stoppoints;
      var fetchedStopList = stops.filter((item => (item.longitude!=0) || (item.latitude!=0 )));
        const minDataItem = fetchedStopList.reduce((prev, current) => (prev.longitude < current.longitude) ? prev : current);
        var requiredLat = minDataItem.latitude;
        var requiredLon = minDataItem.longitude;
      this.mapConfig.defaultCoordinates.latitude = requiredLat;
      this.mapConfig.defaultCoordinates.longitude = requiredLon;
      this.map.getView().setCenter(fromLonLat([this.mapConfig.defaultCoordinates.longitude, this.mapConfig.defaultCoordinates.latitude]));
      this.processFetchData();
    });      
    this.dataSubscription.add(dataFetchSubscription);    
  }
  private processFetchData()
  {
    var patternId:any = this.mapConfig.selectedpatternid ;
      this.drawStops(this.stopList);            
      this.drawStoppoints(this.stoppointList);      
      this.processUrlData();
      this.layerSelection();      
      if (patternId !=undefined &&  patternId !==0) {
        const routeid = this.mapConfig.routeindex;
        var url = AppConfig.settings.apiUrl+'/'+ 'patternsequences' + AppConfig.settings.templateExtension +'/'+this.mapConfig.bvnumber+'/'+routeid
        this.dataService.fetchDataFromApi('patternsequences', url,true).then(async (patterns) => {
          this.segmentsLayer.setVisible(false);
          //this.patternstopptMarkersLayer.setVisible(false);
          this.patternList = patterns;        
          var patternMap = patterns.filter(item=>item.patternindex===patternId);
          this.value = ["Patterns"];
          this.showPattern(patternMap);          
          this.cdr.markForCheck();
          this.segmentsLayer.setVisible(true);
          //this.patternstopptMarkersLayer.setVisible(true);
          this.dataFetched = true;
          this.cdr.detectChanges(); // Workaround for issues with change detection
        });
      }
      else
      {
        this.dataFetched = true;
        this.cdr.detectChanges(); // Workaround for issues with change detection
      }
  }
  public onZoomBtnClick(zoom: Zoom): void {
    const newZoomLevel = Utils.clamp(this.getCurrentZoom() + zoom, this.mapConfig.minZoom, this.mapConfig.maxZoom);
    this.map.getView().animate({
      zoom: newZoomLevel,
      duration: 200,
    });
  }
  private getCurrentZoom(): number {
    if (this.map) {
      return this.map.getView().getZoom() ?? 0;
    }
    return 0;
  }

  public processUrlData(): void {
    var stopId:any = this.mapConfig.selectedstop ;
    var stoppointId:any = this.mapConfig.selectedstoppoint ;
    if (stopId !=undefined &&  stopId !==0) {
      const stop = this.stopsMarkersLayerManager.getModel(stopId);
      if (stop) {
        this.showStop(stop);
        var stopCheck = this.value.filter(p=>p==='Stops')
        if(stopCheck!==undefined && stopCheck.length<1 )
          this.value.push( "Stops");
        this.cdr.markForCheck();
      }
    }
    if (stoppointId !=undefined  &&  stoppointId !==0) {
      const stoppoint = this.stoppointsMarkersLayerManager.getModel(stoppointId);
      if (stoppoint) {
        this.showStopPoint(stoppoint);
        var stoppointCheck = this.value.filter(p=>p==='Stopping Points')
        if(stoppointCheck!==undefined  && stoppointCheck.length<1)
          this.value.push("Stopping Points");
        this.cdr.markForCheck();
      }
    }
    // else if (routeData.selectedPattern) {
    //   this.showPattern(routeData.selectedPattern);
    //   this.cdr.markForCheck();
    // }
  }

  private resetMapFeatures(): void {
    //this.clearSegmentsLayer();
    const mapView = this.map.getView();
    const zoom = this.getCurrentZoom();
    this.stopsMarkersLayerManager.unHighlightStop(mapView, zoom);
    this.stoppointsMarkersLayerManager.unHighlightStopPoint(mapView, zoom);
    //this.routePathManager.clearAllPatternPathData();
    this.cdr.markForCheck();
  }
  private showStop(stop: IStop): void {
    this.resetMapFeatures();
    this.highlightStop(stop);
    this.cdr.markForCheck();
  }

  private highlightStop(stop: IStop): void {
    const markerExists = this.stopsMarkersLayerManager.getMarker(stop);
    if (markerExists) {
      this.stopsMarkersLayerManager.highlightStop(stop, this.map.getView(), this.getCurrentZoom());
      if (stop.longitude !== undefined && stop.latitude !== undefined) {
        this.centerViewToPoint(stop.longitude, stop.latitude);
      }
      //this.snackbarInfoService.openTextSnackbar('Stop details not implemented yet', 'OK', 1500);
    }
  }

  private showStopPoint(stopPoint: IStopPoint): void {
    this.resetMapFeatures();
    this.highlightStopPoint(stopPoint);
    this.cdr.markForCheck();
  }

  private highlightStopPoint(stopPoint: IStopPoint): void {
    const markerExists = this.stoppointsMarkersLayerManager.getMarker(stopPoint);
    if (markerExists) {
      this.stoppointsMarkersLayerManager.highlightStopPoint(stopPoint, this.map.getView(), this.getCurrentZoom());
      if (stopPoint.longitude !== undefined && stopPoint.latitude !== undefined) {
        this.centerViewToPoint(stopPoint.longitude, stopPoint.latitude);
      }
      //this.snackbarInfoService.openTextSnackbar('Stop details not implemented yet', 'OK', 1500);
    }
  }
  private centerViewToPoint(lon: number, lat: number): void {
    const maxZoom = this.mapConfig.stops.genericMarkersZoomLevel + 1;
    const point = new Point(fromLonLat([lon, lat]));
    this.map.getView().fit(point, { maxZoom, duration: 500 });
  }
  private drawStops(stops: IStop[]): void {
    this.stopsMarkersLayerManager.updateMarkersType(this.getCurrentZoom(), this.stopMarkersConfig);
    this.buildStopMarkersLayer(stops);
    this.cdr.markForCheck();
  }
  private buildStopMarkersLayer(stops: IStop[]): void {
    this.stopsMarkersLayerManager.clearMarkers();
    let minLat: number | undefined;
    let maxLat: number | undefined;
    let minLon: number | undefined;
    let maxLon: number | undefined;
    
    stops.forEach(stop => {
      if (!maxLat || stop.latitude > maxLat) {
        maxLat = stop.latitude;
      }
      if (!minLat || stop.latitude < minLat) {
        minLat = stop.latitude;
      }
      if (!maxLon || stop.longitude > maxLon) {
        maxLon = stop.longitude;
      }
      if (!minLon || stop.longitude < minLon) {
        minLon = stop.longitude;
      }
      this.stopsMarkersLayerManager.addMarker(stop, this.map.getView(), this.getCurrentZoom());
    });

    if(this.mapConfig.defaultCoordinates.latitude===0 && this.mapConfig.defaultCoordinates.longitude===0)
    {
      if (minLat && minLon && maxLat && maxLon) {
        this.mapConfig.defaultCoordinates.latitude = (minLat +maxLat)/2;
        this.mapConfig.defaultCoordinates.longitude = (minLon +maxLon)/2;
        const point = new Point(fromLonLat([this.mapConfig.defaultCoordinates.longitude, this.mapConfig.defaultCoordinates.latitude]));
        this.map.getView().setCenter(fromLonLat([this.mapConfig.defaultCoordinates.longitude, this.mapConfig.defaultCoordinates.latitude]));
      } 
    }
    const features = this.stopsMarkersLayerManager.getAllMarkers();
    this.stopMarkersLayer = this.getStopMarkersLayer(features);
    this.map.addLayer(this.stopMarkersLayer);

    this.cdr.markForCheck();
  }
  private getStopMarkersLayer(features: Feature[]): VectorLayer<any> {
    return new VectorLayer({
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      zIndex: this.stopsLayerZindex,
      opacity: 1,
      source: new VectorSource({ features }),
    });
  }
  private drawStoppoints(stoppoints: IStopPoint[]): void {
    this.stoppointsMarkersLayerManager.updateMarkersType(this.getCurrentZoom(), this.stoppointMarkersConfig);
    this.buildStopPointMarkersLayer(stoppoints);
    this.cdr.markForCheck();
  }
  private buildStopPointMarkersLayer(stoppoints: IStopPoint[]): void {
    this.stoppointsMarkersLayerManager.clearMarkers();
    this.vectorSourceStopPoint.clear();
    stoppoints.forEach(stoppoint => {
      this.stoppointsMarkersLayerManager.addMarker(stoppoint, this.map.getView(), this.getCurrentZoom());
    });

    const features = this.stoppointsMarkersLayerManager.getAllMarkers();
    this.stoppointMarkersLayer = this.getStopPointMarkersLayer(features);
    this.map.addLayer(this.stoppointMarkersLayer);

    this.cdr.markForCheck();
  }
  private getStopPointMarkersLayer(features: Feature[]): VectorLayer<any> {
    
    this.vectorSourceStopPoint.addFeatures(features);
    return new VectorLayer({
      updateWhileAnimating: true,
      updateWhileInteracting: false,
      zIndex: this.stoppointsLayerZindex,
      opacity: 1,
      source: this.vectorSourceStopPoint,
    });
  }
  
  private observeMapEvents(): void {
    // Moveend event is also triggered on zoom level change
    const moveEndSubscription = fromEvent(this.map, 'moveend')
      .subscribe(_ => this.onMoveEnd());
    this.mapEventsSubscription.add(moveEndSubscription);
    
    const singleClickSubscription = fromEvent(this.map, 'singleclick')
      .subscribe(evt => this.onMapClick(evt ));
    this.mapEventsSubscription.add(singleClickSubscription);

    const mouseHoverSubscription = fromEvent(this.map, 'pointermove')
      .subscribe(evt => this.onMouseMove(evt ));
    this.mapEventsSubscription.add(mouseHoverSubscription);

    const contextmenuSubscription = fromEvent(this.map, 'contextmenu')
      .subscribe(evt => this.onContextMenu(evt ));
    this.mapEventsSubscription.add(contextmenuSubscription);

    const clickSubscription = fromEvent(this.map, 'click')
      .subscribe(evt => this.onMapDoubleClick(evt ));
    this.mapEventsSubscription.add(clickSubscription);
  }
  private onMoveEnd(): void {
    const currentZoom = this.getCurrentZoom();
    this.map.getTargetElement().style.cursor = 'pointer';
    this.updateStopMarkersOnMoveEnd(currentZoom);
    this.updateStopPointMarkersOnMoveEnd(currentZoom);
    this.updatePatternWidthOnMoveEnd(currentZoom);
    this.cdr.markForCheck();
  }
  private updateStopMarkersOnMoveEnd(currentZoom: number): void {
    this.stopsMarkersLayerManager.updateMarkersType(currentZoom, this.stopMarkersConfig);
    this.updateAllStopMarkers();
  }
  private updateAllStopMarkers(): void {
    this.stopsMarkersLayerManager.updateAllMarkers(this.map.getView(), this.getCurrentZoom());
  }
  private updateStopPointMarkersOnMoveEnd(currentZoom: number): void {
    this.stoppointsMarkersLayerManager.updateMarkersType(currentZoom, this.stoppointMarkersConfig);
    this.updateAllStopPointMarkers(this.showHeading);
  }
  private updateAllStopPointMarkers(setHeading:boolean): void {
    this.stoppointsMarkersLayerManager.showHeading=setHeading;
    this.stoppointsMarkersLayerManager.updateAllMarkers(this.map.getView(), this.getCurrentZoom());
    
  }
  private onMapDoubleClick(evt):void{
    if (!evt.dragging) 
    {
      this.map.removeInteraction(this.dragStopPointInteraction);
    }
  }
  private onMapClick(evt): void {
    if (!evt.dragging) {
      this.showcontextmenu = false;
      //this.hideContextMenu();
      //this.map.removeInteraction(this.dragStopPointInteraction);  
        
      this.resetMapFeatures();      
      
      for (const feature of this.map.getFeaturesAtPixel(evt.pixel)) {
        
        // Hit stop
        const stopId = feature.get(this.stopsMarkersLayerManager.stopIdMarkerKey);
        if (stopId) {
          const stop = this.stopsMarkersLayerManager.getModel(stopId);
          if (stop) {
            this.showStop(stop);
          }
          break;;
        }

        // Hit stoppoint
        const stoppointId = feature.get(this.stoppointsMarkersLayerManager.stoppointIdMarkerKey);
        if (stoppointId) {
          const stoppoint = this.stoppointsMarkersLayerManager.getModel(stoppointId);
          if (stoppoint) {
            this.showStopPoint(stoppoint);
          }
          break;
        }
      }
      if(this.showPatternLayer)
      {
        //var requiredPattern = this.patternList.filter(item=>item.patternindex===this.selectedPatternId);
        //this.showPattern(requiredPattern);
        
      }
    }
  }
  private onMouseMove(evt): void {
    if (!evt.dragging) {
      this.cdr.markForCheck();
      this.mouseoverStopPoint = undefined;
      this.mouseoverPatternStopPoint = undefined;
      for (const feature of this.map.getFeaturesAtPixel(evt.pixel)) {
        
        // Hit stoppoint
        const stoppointId = feature.get(this.stoppointsMarkersLayerManager.stoppointIdMarkerKey);
        if (stoppointId) {
          const stoppoint = this.stoppointsMarkersLayerManager.getModel(stoppointId);
          if (stoppoint) {
            this.mouseoverStopPoint=stoppoint;
          }
          else
          {
            this.mouseoverStopPoint = undefined;
          }
          break;
        }
        if(this.showPatternLayer)
        {
          const patternstoppointId = feature.get(this.routePathManager.patternstoppointIdMarkerKey);
          if (patternstoppointId) {
            const patternstoppoint = this.routePathManager.getModel(patternstoppointId);
            if (patternstoppoint) {
              this.mouseoverPatternStopPoint=patternstoppoint;
            }
            else
            {
              this.mouseoverPatternStopPoint = undefined;
            }
            return;
          }
        }
      }
       
    }
  }
  private onContextMenu(evt): void {    
    console.info('contextmenu');
    for (const feature of this.map.getFeaturesAtPixel(evt.pixel)) {        
      // Hit stoppoint
      const stoppointId = feature.get(this.stoppointsMarkersLayerManager.stoppointIdMarkerKey);
      if (stoppointId) {
        evt.preventDefault();
        this.showcontextmenu = true;
        //var coordianteSelected = this.map.getCoordinateFromPixel(evt.pixel);
        this.openContextMenu(evt.pixel[0], evt.pixel[1]);
        //this.variableTopHeight = evt.pixel[1];
        //this.variableLeftHeight = evt.pixel[0];
        
      }
    }
  }
  public layerSelection() 
  {
    var stopCheck = this.value.filter(p=>p==='Stops')
    if(stopCheck!==undefined && stopCheck.length>0)
    {
      this.stopMarkersLayer.setVisible(true);
    }
    else
    {
      this.stopMarkersLayer.setVisible(false);
    }
    var stopPointCheck = this.value.filter(p=>p==='Stopping Points')
    if(stopPointCheck!==undefined && stopPointCheck.length>0)
    {
      this.stoppointMarkersLayer.setVisible(true);
    }
    else
    {
      this.stoppointMarkersLayer.setVisible(false);
    }
    var patternCheck = this.value.filter(p=>p==='Patterns')
    if(patternCheck!==undefined && patternCheck.length>0)
    {
      this.segmentsLayer.setVisible(true);
      //this.patternstopptMarkersLayer.setVisible(true);
    }
    else
    {
      this.segmentsLayer.setVisible(false);
      //this.patternstopptMarkersLayer.setVisible(false);
    }
  }
  public get highlightedStop(): IStop | undefined {
    
      return this.stopsMarkersLayerManager.getHighlightedStop() ?? undefined; // Fix for null values
   
  }
  public get highlightedStopPoint(): IStopPoint | undefined {
    return this.stoppointsMarkersLayerManager.getHighlightedStopPoint() ?? undefined; // Fix for null values
     
  }
  public get mouseHoverStopPoint(): IStopPoint | undefined {
    return this.mouseoverStopPoint ?? undefined; // Fix for null values
     
  }
  public get mouseHoverPatternStopPoint(): IStopPoint | undefined {
    return this.mouseoverPatternStopPoint ?? undefined; // Fix for null values
     
  }
  public mapSelection() 
  {
    this.buildTileLayers();
    this.map.getControls()
  }
  public get displayedPattern(): any[] | undefined {
    return this.routePathManager?.getDisplayedPattern() ?? undefined; // Fix for null values
  }
  public get showRouteBtnHighlighted(): boolean {
    return !!this.displayedPattern;
  }
  public get showPatternLayer(): boolean {
    var patternlayervisible=false;
    if(this.value)
    {
      var patternCheck = this.value.filter(p=>p==='Patterns');
      patternlayervisible = (patternCheck!==undefined && patternCheck.length>0);
    }
    return patternlayervisible;
  }
  private get routePathConfig(): IRoutePathConfig {
    return this.mapConfig.routePath;
  }
  public selectPattern(selectedpattern: any): void 
  {    
    this.dataFetched=false;
    var url = AppConfig.settings.apiUrl+'/'+ 'patternsequences' +'/'+this.mapConfig.bvnumber+'/'+selectedpattern.routeindex+'/'+selectedpattern.patternindex;
    this.http.get<any[]>(url,).subscribe( (patternsequences) => {
      var pattern = patternsequences;
      this.dataFetched=true;
      this.CreatePattern(pattern);
    });
  }
  public showPattern(pattern: any[]): void {
    if(this.patternList)
    {
      this.CreatePattern(pattern);
    }
    else
    {
      var url = AppConfig.settings.apiUrl+'/'+ 'patternsequences' + AppConfig.settings.templateExtension +'/'+this.mapConfig.bvnumber+'/'+this.mapConfig.routeindex
      this.dataService.fetchDataFromApi('patternsequences', url,true).then(async (patterns) => {
        this.patternList = patterns;
        this.CreatePattern(pattern);
      });
    }
  }
  private CreatePattern(pattern:any[])
  {
    this.resetMapFeatures();
    const color = "red";
    if(pattern.length>0)
    {
      this.selectedPatternId = pattern[0].patternindex;
    }
    this.updateOrCreatePatternPathFeatures(pattern,  color);
    
    this.fitViewToPattern(pattern);
    this.cdr.markForCheck();
  }
  private updateOrCreatePatternPathFeatures(
    pattern: any[],
    remainingPathColor: string,
  ): void {
    var patternstopptlist = this.stoppointList.filter(item1 => pattern.some(item2 => item2['stoppingpoint'] === item1['netzpunktindex']));   
    this.routePathManager.patternstopptlist = patternstopptlist;    
    if (this.displayedPattern && this.displayedPattern[0].patternindex === pattern[0].patternindex) {
      this.routePathManager.updatePatternSegmentFeatures(
        pattern,
        remainingPathColor,
      );
    } else {
      this.routePathManager.createPatternSegmentFeatures(
        pattern,
        remainingPathColor,
      );
    }
    
    this.clearSegmentsLayer();
    const features = this.routePathManager.getPatternFeatures();
    this.addFeaturesToSegmentsLayer(features);
    this.cdr.markForCheck();
  }

  private clearSegmentsLayer(): void {
    const source = this.segmentsLayer?.getSource() as VectorSource | undefined;
    source?.clear();
    this.vectorSourcePattern.clear();
  }

  private addFeaturesToSegmentsLayer(features: Feature[]): void {
    this.vectorSourcePattern.addFeatures(features);
    const featuresStop = this.routePathManager.getPatternStopFeatures();
    const featureShapepoints = this.routePathManager.getLinkPatternFeatures();
    this.vectorSourcePattern.addFeatures(featuresStop);
    this.vectorSourcePattern.addFeatures(featureShapepoints);
  }

  private fitViewToPattern(pattern: any[]): void {
    let minLat: number | undefined;
    let maxLat: number | undefined;
    let minLon: number | undefined;
    let maxLon: number | undefined;
    pattern.forEach(p => {
      if (!maxLat || p.latitude > maxLat) {
        maxLat = p.latitude;
      }
      if (!minLat || p.latitude < minLat) {
        minLat = p.latitude;
      }
      if (!maxLon || p.longitude > maxLon) {
        maxLon = p.longitude;
      }
      if (!minLon || p.longitude < minLon) {
        minLon = p.longitude;
      }
    });
    if (minLat && minLon && maxLat && maxLon) {
      const extent = boundingExtent([fromLonLat([minLon, minLat]), fromLonLat([maxLon, maxLat])]);
      this.map.getView().fit(extent, { maxZoom: this.stoppointMarkersConfig.genericMarkersZoomLevel });
    } 
    // else {
    //   console.log(`Cannot fit the map view to pattern with DUID: ${ pattern[0].primarykeyduid }. Coordinates not found`);
    //   //this.logger.warning(() => `Cannot fit the map view to pattern with DUID: ${ pattern.primaryKeyDuid }. Coordinates not found`, this.logPrefix);
    // }
  }
  
  private updatePatternWidthOnMoveEnd(currentZoom: number): void {
    const isPatternDisplayed = !!this.displayedPattern;
    if (isPatternDisplayed) {
      const isChanged = this.routePathManager.changePathSegmentsWidth(currentZoom);
      if (isChanged) {
        //this.logger.debug(() => `Path segments width changed. New width: ${ this.routePathManager.getPathSegmentsWidth() }`, this.logPrefix);
        this.clearSegmentsLayer();
        const features = this.routePathManager.getPatternFeatures();
        this.addFeaturesToSegmentsLayer(features);
      }
    }
  }
  private updateAllPatternPointMarkers(setHeading:boolean): void {
    this.routePathManager.showHeading=setHeading;
    this.routePathManager.updateAllStopPointMarkers(this.map.getView(), this.getCurrentZoom());
    
  }
  public headingSelection()
  {
    this.updateAllStopPointMarkers(!this.showHeading);
    if(this.showPatternLayer)
    {
      this.updateAllPatternPointMarkers(!this.showHeading);
    }
  }
  public editPatternSelection()
  {    
    if(!this.editPattern)
    {      
      this.map.addInteraction(this.dragInteraction);    
    }
    else
    {
      this.map.removeInteraction(this.dragInteraction);  
    }
  }
  public movePoint() {
    this.map.addInteraction(this.dragStopPointInteraction);  
    this.showcontextmenu = false;
  }
}