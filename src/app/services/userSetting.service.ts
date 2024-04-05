import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserSettingService {
  private settingsUrl = 'assets/mocks/userSetting.json';
  private settingsSubject = new BehaviorSubject<any>({});
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSettings(): Observable<any> {
    return this.http.get<any>(this.settingsUrl);
  }

  saveSettings(settings: any): Observable<any> {
    // Save settings to API or local storage
    return this.http.post(this.settingsUrl, settings);
  }

  updateLocalSettings(settings: any) {
    this.settingsSubject.next(settings);
  }
}
