import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { IStop } from '../interfaces';
import { AppConfig } from 'src/app/AppConfig.service';
import { DataService } from 'src/app/data.service';
@Injectable({
  providedIn: 'root'
})
export class StoplistService {
  private mockedStopList?: IStop[];

  constructor(private readonly http: HttpClient,private readonly dataService:DataService) { }

  fetchData(bvNumber:number) : Observable<IStop[]>
  {
    var url: string = 'assets/mocks/stops.json';
    if(bvNumber>0)
      url = AppConfig.settings.apiUrl+'/stops/'+bvNumber;
    //var response= await  this.dataService.fetchDataFromApi('stops', url);
    return this.http.get<IStop[]>(url).
    pipe(
     //map(vehicles => vehicles.slice(0, 1 )), use this when you want to fiter for x number of rows
      map(sessions => sessions.map(s => ({
        ...s,
      } as IStop))),
      tap(sl => this.mockedStopList = sl));
  }


  // fetchSession()
  // {
  //   const url: string = 'assets/mocks/activesession.json';
  //   this.http.get<MockedActiveSession[]>(url).pipe(map(responseData=>{
  //     const activeArray : ActiveSession[] = [];
  //     for(const key in activeArray)
  //     {
  //       activeArray.push({...responseData})
  //     }
  //   }))
  // }
  // public getActiveSessions$(): Observable<ActiveSession[]> {
  //   if (this.mockedActiveSessions) {
  //     return of(this.mockedActiveSessions);
  //   }
  //   const url: string = 'ssets/mocks/activesession.json';
  //   return this.http.get(url).subscribe((response) => {
  //    response;
  //   });

  //   // return this.http.get<MockedActiveSession[]>('assets/mocks/activesession.json').pipe(
  //   //   map(activesessions => activesessions.slice(0, 100)),
  //   //   map(activesessions => activesessions.map(a => ({
  //   //     ...a,
  //   //     // lastEvent: '',
  //   //     BVNumber: a.BVNumber,
  //   //     Description: a.Description,
  //   //     User: a.User,
  //   //     } as ActiveSession))),
  //   //   tap(al => this.mockedActiveSessions = al));
 
  // }
}
export type MockedStopList =IStop;
