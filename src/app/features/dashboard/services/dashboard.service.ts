import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import {BaseVersion } from  '../components/dashboard/baseversions';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private mockedBaseVersions? : BaseVersion[];
  constructor(private readonly http: HttpClient) { }

  FetchData(url:string) : Observable<BaseVersion[]>
  {
    return this.http.get<BaseVersion[]>(url).pipe
    (map(baseVersions => baseVersions.map(b =>  ({
      ...b,
    } as BaseVersion))),tap(b1 => this.mockedBaseVersions = b1));
  }
}
