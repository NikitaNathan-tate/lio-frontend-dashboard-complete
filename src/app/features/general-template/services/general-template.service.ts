import { EventEmitter, Injectable } from '@angular/core';
import { GeneralTemplateComponent } from '../general-template/general-template.component';
import { Subject } from 'rxjs/internal/Subject';

export type DataType = { selectedMenu: string };

@Injectable({
    providedIn: 'root'
  })
export class GeneralTemplateService {
  private openWindows: GeneralTemplateComponent[] = [];
  dataSubject = new Subject<DataType>();
  constructor() {}

  private eventEmitter: EventEmitter<any> = new EventEmitter<any>();
  private openEventEmitter: EventEmitter<any> = new EventEmitter<any>();

  emitEvent(data: any) {
    this.eventEmitter.emit(data);
  }

  getEventEmitter() {
    return this.eventEmitter;
  }

  emitOpenEvent(data: any) {
    this.openEventEmitter.emit(data);
  }

  getOpenEventEmitter() {
    return this.openEventEmitter;
  }

  addWindow(window: GeneralTemplateComponent) {
    this.openWindows.push(window);
  }

  removeWindow(window: GeneralTemplateComponent) {
    const index = this.openWindows.indexOf(window);
    if (index > -1) {
      this.openWindows.splice(index, 1);
    }
  }

  getOpenWindows() {
    return this.openWindows;
  }
}
