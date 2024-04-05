import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { Utils } from 'src/app/shared/utils/utils';
import { AppConfig } from 'src/app/AppConfig.service';
import { DataService } from 'src/app/data.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from 'src/app/storage/storageservice';

@Component({
  selector: 'app-routes-list-dialog',
  templateUrl: './routes-list-dialog.component.html',
  styleUrls: ['./routes-list-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesListDialogComponent implements OnInit, OnDestroy {
  public readonly Utils = Utils;
  public patternNumberFilterValue = '';
  public shortNameFilterValue = '';
  public dataLoaded = false;
  public displayedPatterns: any[] = [];
  public routeRepresentation:any;

  private patternsSubscription?: Subscription;
  public patterns?: any[];

  constructor(
    private matDialogRef: MatDialogRef<RoutesListDialogComponent>,
    private readonly cdr: ChangeDetectorRef,private dataService:DataService,
    private http: HttpClient,public storageService: StorageService
  ) {
  }

  public ngOnInit(): void 
  {    
    
  }
  public ngAfterViewInit(): void 
  {    
    this.applyFilters();
    this.cdr.markForCheck();
  }
 
  public ngOnDestroy(): void {
    this.patternsSubscription?.unsubscribe();
  }

  public onPatternClick(pattern: any): void {
    if (pattern) {
      var patternMap = this.patterns.filter(item=>item.patternindex===pattern.patternindex);
      this.matDialogRef.close({ data: patternMap[0] });
    }
  }

  public onPatternNumberFilterChange(filterValue: string): void {
    this.patternNumberFilterValue = filterValue;
    this.applyFilters();
    this.cdr.markForCheck();
  }

  public getroute(routeindex:number)
  {
    var selectedRoute = this.routeRepresentation.filter(p=>p.Value ==routeindex);
    if(selectedRoute)
      return selectedRoute[0].Text;
    else
      return routeindex;
  }

  private applyFilters(): void {
    if (this.patterns) {
      this.displayedPatterns = this.patterns.filter(p => {
        return (!this.patternNumberFilterValue || p.patternnumber === +this.patternNumberFilterValue) ;
      });
    }
  }
}
