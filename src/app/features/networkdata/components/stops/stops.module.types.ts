import { InjectionToken } from '@angular/core';
import { IStopTableService } from './interfaces';

export const STOPS_SERVICE = new InjectionToken<IStopTableService>('STOPS_SERVICE');
