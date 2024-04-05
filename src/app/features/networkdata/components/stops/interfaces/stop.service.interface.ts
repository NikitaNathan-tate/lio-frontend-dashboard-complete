import { Observable } from 'rxjs';
import { IStop } from './stop.interface';


export interface IStopTableService  {
  getStops$(): Observable<IStop[] | undefined>;
}
