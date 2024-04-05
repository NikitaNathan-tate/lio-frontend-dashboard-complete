import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig.service';
import { IStopPoint } from '../interfaces/stoppoint.interface';
@Injectable({
  providedIn: 'root'
})
export class StoppointlistService {
  private mockedStoppointList?: IStopPoint[];

  constructor(private readonly http: HttpClient) { }

  fetchData(bvNumber:number) : Observable<IStopPoint[]>  
  {
    var url: string = 'assets/mocks/stoppoints.json';
    if(bvNumber>0)
      url = AppConfig.settings.apiUrl+'/stoppoints/'+bvNumber;
    return this.http.get<IStopPoint[]>(url).
    pipe(
      map(sessions => sessions.map(s => ({
        ...s,
      } as IStopPoint))),
      tap(sl => this.mockedStoppointList = sl));
  }

}
export type MockedStopPointList =IStopPoint;
