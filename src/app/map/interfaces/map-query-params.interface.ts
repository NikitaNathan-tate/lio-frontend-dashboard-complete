import { Params } from '@angular/router';

export interface IMapQueryParams extends Params {
  selectedStopId?: any;
  selectedStopPointId?: any;
  selectedPatternId?: any;
  bvNumber?:number;
  routeindex?:number;
}
