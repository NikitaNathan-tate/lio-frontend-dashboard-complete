import { Inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IStop, IStopTableService } from '../interfaces';


@Injectable({
  providedIn: 'root',
})
export class StopsTableMockedService  implements IStopTableService {
  private mockedStops?: IStop[];
  constructor(
    private readonly http: HttpClient
  ) {
    
  }
  
  public getStops$(): Observable<IStop[]> {
    if (this.mockedStops) {
      return of(this.mockedStops);
    }
    return this.http.get<MockedStop[]>('assets/mocks/stops.json').pipe(
      map(stops => stops.slice(0, 100)),
      map(stops => stops.map(v => ({
        ...v,
        // lastEvent: '',
        //mobilePhoneNumber: '0797697',
        //licensePlate: `DW${ Utils.getRandomInt(100, 9999) }`,
        //headwayDeviation: Utils.getRandomInt(1, 4) === 1 ? undefined : Utils.getRandomInt(-6 * 60, 6 * 60),
        //timetableDeviation: Utils.getRandomInt(1, 4) === 1 ? undefined : Utils.getRandomInt(-2 * 60, 3 * 60),
        // layoverTime: 0,
        // layoverTime: undefined,
        //layoverTime: Utils.getRandomInt(-5 * 60 * 60, 7 * 60 * 60),
        //loggedOn: Utils.getRandomInt(0, 10) > 1,
        //positioned: Utils.getRandomInt(0, 10) > 2,
        //radioState: Utils.getRandomInt(0, 10) > 1,
        // route: undefined,
        //route: Utils.getRandomInt(100, 999),
        // run: undefined,
        //run: Utils.getRandomInt(0, 500),
        // block: undefined,
        //block: Utils.getRandomInt(0, 500),
        // tripNumber: undefined,
        //tripNumber: Utils.getRandomInt(0, 1500),
        // pattern: undefined,
        //pattern: Utils.getRandomInt(1000, 9999),
        // prevStopCode: undefined,
        //prevStopCode: v.stoCode,
        //nextStopCode: v.stopCpde,
        // nextStopCode: undefined,
        // destStopCode: undefined,
        //destStopCode: v.shortCode,
        //nextStopDistanceMeters: Utils.getRandomInt(0, 4) === 0 ? 0 : Utils.getRandomInt(1, 1000),
      } as IStop))),
      tap(vl => this.mockedStops = vl));
  }
}

export type MockedStop = IStop & {
  stoCode: string;
  stopCpde: string;
};
