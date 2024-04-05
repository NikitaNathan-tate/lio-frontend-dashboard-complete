import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { ActiveSession } from '../components/activesession/activesession';
import { AppConfig } from 'src/app/AppConfig.service';
import { StorageService } from 'src/app/storage/storageservice';
@Injectable({
  providedIn: 'root'
})
export class ActivesessionService {
  private mockedActiveSessions?: ActiveSession[];

  constructor(private readonly http: HttpClient,public storageService: StorageService) { }

  fetchData() : Observable<ActiveSession[]>  
  {
    var url: string = 'assets/mocks/activesession.json';
    url = AppConfig.settings.apiUrl+'/activesessions'+AppConfig.settings.templateExtension;

    return this.http.get<ActiveSession[]>(url).
    pipe(
     //map(vehicles => vehicles.slice(0, 1 )), use this when you want to fiter for x number of rows
      map(sessions => sessions.map(s => ({
        ...s,
      } as ActiveSession))),
      tap(sl => this.mockedActiveSessions = sl));
  }

}
export type MockedActiveSession =ActiveSession;
