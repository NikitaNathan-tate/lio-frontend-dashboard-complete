import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { IMapConfig } from '../../interfaces/ui-config.interface';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapPageComponent  implements OnInit{
  public mapConfig!: IMapConfig;
  public bvnumber!: number;
  public constructor(
    private readonly cdr: ChangeDetectorRef
  ) {    
  }
  @ViewChild(MapComponent) childComponent!: MapComponent;
  public ngOnInit(): void {
    this.setmapconfig();
    const queryString = window.location.search;
    // Call the parent function with the received message
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('bvNumber');
    this.bvnumber = parseInt(id);
    this.mapConfig.bvnumber = this.bvnumber;
    const stopid = urlParams.get('selectedStopId');
    this.mapConfig.selectedstop = stopid!=undefined ?parseInt(stopid):0;
    const stoppointid = urlParams.get('selectedStopPointId');
    this.mapConfig.selectedstoppoint = stoppointid!=undefined ?parseInt(stoppointid):0;
    const patternid = urlParams.get('selectedPatternId');
    this.mapConfig.selectedpatternid = patternid!=undefined ?parseInt(patternid):0;
    const routeid = urlParams.get('routeindex');
    this.mapConfig.routeindex = routeid!=undefined ?parseInt(routeid):0;      
  }
  private setmapconfig()
  {
    this.mapConfig= {
      tilesService: {
        type: 'osm',
        layers: 'ws_geoserver_map_db:dcg2_layer_group',
        styles: {
          layers: [
            "background",
          "mapbox",
          "water",
          "nature_areas",
          "waterways",
          "ditch",
          "ordered_roads_pedestrian_area",
          "ordered_roads",
          "ordered_small_roads",
          "ordered_roads_overlay",
          "tram_roads",
          "buildings",
          "places"
          ],
          token: '',
        },
        endpoints: {
          tms: 'geoserver/gwc/service/tms/1.0.0/ws_geoserver_map_db:dcg2_layer_group@pbf/{z}/{x}/{-y}.pbf',
          wms: 'geoserver/wms',
          xyz: 'tilegen/{z}/{x}/{y}.png',
        },
        forceOpenStreetMaps: false,
      },
      defaultCoordinates: {
        latitude:0,
        longitude: 0,
      },
      zoom: 14,
      maxZoom: 20,
      minZoom: 4,
      preload: 10,
      stops: {
        bgColor: '#ffc107',
        fontColor: '#424242',
        genericMarkerSize: 6,
        genericMarkerSizeIncreaseFactor: 2,
        genericMarkersZoomLevel: 16,
        noMarkersZoomLevel: 11,
      },
      stoppoints: {
        labelFontSizePx: 16,
        bgColor: '#651fff',
        genericMarkerSize: 8,
        genericMarkerSizeIncreaseFactor: 3,
        genericMarkersZoomLevel: 16,
        noMarkersZoomLevel: 11,
      },
      routePath: {
        remainingPathColor: '#9e9e9e',
        traveledPathColor: '#e91e63',
        pathBaseWidth: 2,
        pathWidthIncreaseFactor: 1,
        noRouteZoomLevel: 11,
        manuallySelectedPatternColor: '#651fff'
      },
      bvnumber:this.bvnumber,
      selectedstop:0,
      selectedstoppoint:0,
      selectedpatternid:0,
      routeindex:0
    }
  }
  // Listen for the message event from the parent window
  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    const data = event.data;
    // Check if the data is coming from the parent
    if (data && data.message) {
      // Call the parent function with the received message
      const urlParams = new URLSearchParams(data.message);
      const id = urlParams.get('bvNumber');
      this.mapConfig.bvnumber = parseInt(id);
      const stopid = urlParams.get('selectedStopId');
      if(stopid!=undefined)
        this.mapConfig.selectedstop = stopid!=undefined ?parseInt(stopid):0;
      const stoppointid = urlParams.get('selectedStopPointId');
      if(stoppointid!=undefined)
        this.mapConfig.selectedstoppoint = stoppointid!=undefined ?parseInt(stoppointid):0;
      const patternid = urlParams.get('selectedPatternId');
      if(patternid!=undefined)
        this.mapConfig.selectedpatternid = patternid!=undefined ?parseInt(patternid):0;
      const routeid = urlParams.get('routeindex');
      if(routeid!=undefined)
        this.mapConfig.routeindex = routeid!=undefined ?parseInt(routeid):0;
      this.childComponent.processUrlData();
      this.childComponent.layerSelection(); 
    }
  }
}
