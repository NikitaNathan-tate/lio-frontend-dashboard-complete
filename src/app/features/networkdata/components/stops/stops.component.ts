import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, map, Observable, startWith, Subscription, timer } from 'rxjs';
import { CompositeFilterDescriptor, FilterDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { CellClickEvent, ColumnMenuSettings, PageChangeEvent } from '@progress/kendo-angular-grid';
import { MatDialog } from '@angular/material/dialog';
import { IStop, IStopTableService } from './interfaces';
import { STOPS_SERVICE } from './stops.module.types';
import { HttpClient } from '@angular/common/http';
import { StoplistService } from './services';

@Component({
  selector: 'app-stops',
  templateUrl: './stops.component.html',
  styleUrls: ['./stops.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopsComponent implements OnInit, OnDestroy {
  public readonly pageSize = 50;
  public readonly doNotCommaSeparateNumberFormat = '################';
  public stops?: IStop[];
  public mockedStops?: IStop[];
  public sortDescriptor: SortDescriptor[] = [];
  public skip = 0;
  public columnMenu: ColumnMenuSettings = {
    filter: false,
    columnChooser: true,
    sort: true,
    autoSizeAllColumns: false,
    autoSizeColumn: false,
    lock: true,
  };
  public readonly columnWidth = {
    stop: {
      minWidth: 140,
      maxWidth: 350,
    },
    stopNumber: {
      minWidth: 225,
      maxWidth: 525,
    },
    externalId: {
      minWidth: 175,
      maxWidth: 600,
    },
    shortCode: {
      minWidth: 100,
      maxWidth: 275,
    },
    longDescription: {
      minWidth: 75,
      width: 135,
      maxWidth: 170,
    },    
    longNumber: {
      minWidth: 75,
      width: 135,
      maxWidth: 170,
    },    
    zoneWabe: {
      minWidth: 75,
      maxWidth: 250,
    },
    ibisName: {
      minWidth: 100,
      maxWidth: 275,
    },
    tlpMode: {
      minWidth: 75,
      maxWidth: 250,
    },
    vehAnnouncementText: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    stopPoints: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    farePointName: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    mfdTransferScreen: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    previewTime: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    importState: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    latitude: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    longitude: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
    commentary: {
      minWidth: 75,
      width: 140,
      maxWidth: 250,
    },
  };
  
  public readonly tlpModeFilterValues = [
    { text: 'No activity', value: 0 },
    { text: 'auto.', value: 1 },
    { text: 'manual', value: 2 },
  ];
  public tlpModeFilter: { text: string; value: number  } = { text: 'No activity', value: 0 };
  
  public filter!: CompositeFilterDescriptor;
  public showSpinner$?: Observable<boolean>;

  private windowResizeObserver?: Subscription;
  private readonly girdLoadSpinnerTimeMs = 500;
  private readonly unknownDeviationColor = '#bdbdbd'; // grey/400
  private stopsSubscription?: Subscription;

  /*constructor(
    @Inject(STOPS_SERVICE) private readonly stopsService: IStopTableService,
    private readonly cdr: ChangeDetectorRef,
    private readonly matDialog: MatDialog,
  ) {
  }*/

  private stopListSubscription?: Subscription;
  constructor(private http: HttpClient,private stopListService : StoplistService) 
    {
  }

  /*public ngOnInit(): void {
    this.stopsSubscription = this.stopsService.getStops$().subscribe(vl => {
      this.stops = vl;
      this.cdr.markForCheck();
    });
    this.observeWindowResize();
    this.showSpinner$ = timer(this.girdLoadSpinnerTimeMs).pipe(
      map(_ => false),
      startWith(true),
    );
  }*/

  public ngOnInit(): void {
    this.getData();
  }
getData()
{
  //   this.fetchData().subscribe(vl => {
  //   this.userInfo = vl;
  // });
  this.stopListService.fetchData(0).subscribe(a1 => {
    this.mockedStops = a1
  });
   
}

  public ngOnDestroy(): void {
    this.windowResizeObserver?.unsubscribe();
    this.stopsSubscription?.unsubscribe();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  }

  public handleSortChange(descriptor: SortDescriptor[]): void {
    this.sortDescriptor = descriptor;
  }
  
/*
  public onColumnsVisibilityChange(): void {
    this.cdr.markForCheck(); // Workaround for some issues with kendoUI grid when change detection onPush
  }

  public onColumnsLockedChange(): void {
    this.cdr.markForCheck(); // Workaround for some issues with kendoUI grid when change detection onPush
  }

  public onFilterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.cdr.markForCheck(); // Workaround for some issues with kendoUI grid when change detection onPush
  }
*/
  public getPx(value: number): string {
    return `${ value >= 0 ? value : 0 }px`;
  }

  public get stopColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.stop.minWidth;
    }
    if (window.innerWidth <= 1800) {
      return 200;
    }
    return 250;
  }

  public get stopNumberColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.stopNumber.minWidth;
    }
    if (window.innerWidth <= 1800) {
      return 265;
    }
    return 475;
  }

  public get shortCodeColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.shortCode.minWidth;
    }
    if (window.innerWidth <= 1800) {
      return 200;
    }
    return 275;
  }

  public get externalIdColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.externalId.minWidth;
    }
    if (window.innerWidth <= 1800) {
      return 265;
    }
    return 475;
  }

  public get longDescriptionColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.longDescription.minWidth;
    }
    return this.columnWidth.longDescription.width;
  }

  public get longNumberColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.longNumber.minWidth;
    }
    return this.columnWidth.longNumber.width;
  }

  public get zoneWabeColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return this.columnWidth.zoneWabe.minWidth;
    }
    if (window.innerWidth <= 1800) {
      return 265;
    }
    return 475;
  }

  public get ibisNameColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 100;
    }
    return 140;
  }

  public get tlpModeValueColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 125;
    }
    return 225;
  }

  public get vehAnnouncementTextColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }

  public get farePointNameColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }

  public get mfdTransferScreenColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }
  public get previewTimeColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }
  public get importStateColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }
  public get latitudeColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }
  public get longitudeColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }
  public get commentaryColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }
  public get stopPointsColumnWidth(): number {
    if (window.innerWidth <= 1500) {
      return 140;
    }
    return 200;
  }

  

  
  private flatten(filter: GridFilter): FilterDescriptor[] {
    if ('filters' in filter) {
      return filter.filters.reduce(
        (acc: GridFilter[], curr: GridFilter) => acc.concat(this.flatten(curr)),
        [],
      ) as FilterDescriptor[];
    }
    return [filter];
  };
}

type GridFilter = CompositeFilterDescriptor | FilterDescriptor;

