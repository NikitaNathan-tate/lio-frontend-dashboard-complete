import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { Injectable } from '@angular/core';

import { UserActivityLog } from '../components/useractivitylog/useractivitylog';
import { AppConfig } from 'src/app/AppConfig.service';

@Injectable({
  providedIn: 'root'
})
export class UseractivitylogService {

private mockedUserActivityLog?: UserActivityLog[];

  constructor(private readonly http: HttpClient) { }

  FetchData() : Observable<UserActivityLog[]>  
  {
    var url: string = 'assets/mocks/useractivitylog.json';
    url = AppConfig.settings.apiUrl+'/useractivity'+AppConfig.settings.templateExtension;

    return this.http.get<UserActivityLog[]>(url).
    pipe(
     //map(vehicles => vehicles.slice(0, 1 )), use this when you want to fiter for x number of rows
      map(sessions => sessions.map(s => ({
        ...s,
      } as UserActivityLog))),
      tap(sl => this.mockedUserActivityLog = sl));
  }
}