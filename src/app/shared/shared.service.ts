import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  readonly APIUrl = "https://localhost:7182";
  
  constructor(private http: HttpClient) {}

  getControlletData(pathName :string): Observable < any[] > {
      let url = 'http://localhost:7182/stops';
      return this.http.get <any> (url);

  }
}
