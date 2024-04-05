export interface IMapConfig {
  tilesService?: IMapTilesConfig;
  defaultCoordinates: ICoords;
  bbox?: {
    min: ICoords;
    max: ICoords;
  };
  zoom: number;
  minZoom: number;
  maxZoom: number;
  preload: number;
  stops: IStopMarkersConfig;
  stoppoints: IStopPointMarkersConfig;
  routePath: IRoutePathConfig;
  bvnumber:number;
  selectedstop?:any;
  selectedstoppoint?:any;
  selectedpatternid?:any;
  routeindex?:any;
}

export interface IMapTilesConfig {
  type: 'tms' | 'wms' | 'osm' | '';
  layers: string;
  styles: {
    layers: string[];
    token: string;
  };
  forceOpenStreetMaps?: boolean;
  endpoints: {
    wms?: string;
    tms?: string;
    xyz?: string;
  };
}

export interface ICoords {
  latitude: number;
  longitude: number;
}

export interface IMarkerSizeConfig {
  genericMarkerSize: number;
  genericMarkerSizeIncreaseFactor: number;
  genericMarkersZoomLevel: number; // When zoom level is below or equal given level, show generic markers instead of detailed one
  noMarkersZoomLevel: number; // When zoom level is below or equal given level, don't show markers
}

export interface IStopMarkersConfig extends IMarkerSizeConfig {
  bgColor: string;
  fontColor: string;
}

export interface IStopPointMarkersConfig extends IMarkerSizeConfig {
  labelFontSizePx: number;
  bgColor: string;
}
export interface IRoutePathConfig {
  traveledPathColor: string;
  remainingPathColor: string;
  pathBaseWidth: number;
  pathWidthIncreaseFactor: number;
  noRouteZoomLevel: number;
  manuallySelectedPatternColor: string;
}

