import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig.service';
import { IStopPoint } from '../interfaces/stoppoint.interface';
@Injectable({
  providedIn: 'root'
})
export class PatternlistService {
  private mockedPatternList?: any[];

  constructor(private readonly http: HttpClient) { }

  fetchData(bvNumber:number,routeIndex:number) : Observable<any[]>  
  {
    var url: string = 'assets/mocks/pattern.json';
      url = AppConfig.settings.apiUrl+'/patternsequences/'+bvNumber+'/'+routeIndex;
      return this.http.get<any[]>(url).
      pipe(
        map(sessions => sessions.map(s => ({
          ...s,
        } ))),
        tap(sl => this.mockedPatternList = sl));
  }

}
export type MockedPatternList =any;
