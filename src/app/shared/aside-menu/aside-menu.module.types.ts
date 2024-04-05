import { InjectionToken } from '@angular/core';
import { ISearchService } from './interfaces';

export const SEARCH_SERVICE = new InjectionToken<ISearchService>('SEARCH_SERVICE');
