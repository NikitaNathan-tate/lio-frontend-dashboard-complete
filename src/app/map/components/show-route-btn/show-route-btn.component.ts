import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subscription, map, tap } from 'rxjs';
import { IPatternMap } from '../../interfaces/pattern-map.interface';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from 'src/app/AppConfig.service';
import { RoutesListDialogComponent } from '../routes-list-dialog/routes-list-dialog.component';
import { StorageService } from 'src/app/storage/storageservice';

@Component({
  selector: 'app-show-route-btn',
  templateUrl: './show-route-btn.component.html',
  styleUrls: ['./show-route-btn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowRouteBtnComponent implements OnInit,OnDestroy {
  @Input() public isHighlighted = false;
  @Input() public isPatternLayer = false;
  @Input() public bvnumber:number;
  @Output() public showRoute = new EventEmitter<any[]>();

  private dialogAfterCloseSubscription?: Subscription;
  private mockedPatternList?: IPatternMap[];
  private routeRepresentation:any;
  private patterns?: any[];

  constructor(
    //@Inject(CONFIG_SERVICE) private readonly configService: IConfigService,
    private readonly matDialog: MatDialog,private http: HttpClient,public storageService: StorageService
  ) {
  }

  public ngOnInit(): void {
    var url = AppConfig.settings.apiUrl+'/'+ 'patterns' +'/'+this.bvnumber;
    this.storageService.getRequiredItem(this.bvnumber+'_'+ 'gdm:linie'	, 'Representation').then((items) => {
      if (items.length > 0) {
        var itemData = items[0];            
        const mappedData: { Value: number, Text: string }[] = [];
        var itemColumns = itemData.columns;
        for (let key in itemColumns) {
          if (itemColumns.hasOwnProperty(key)) {
            mappedData.push({ Value: +key, Text: itemColumns[key] });
          }
        }  
        this.routeRepresentation = mappedData;
        this.http.get<any[]>(url,).subscribe((patterns) => {
          this.patterns = patterns.sort((p1, p2) => p1.routeindex - p2.routeindex).sort((p1, p2) => p1.patternnumber - p2.patternnumber);          
        });
        }
      });
    
  }
  public ngOnDestroy(): void {
    this.dialogAfterCloseSubscription?.unsubscribe();
  }

  public onShowRouteClick(): void {
    this.openRouteDialog();
  }

  private openRouteDialog(): void {
    const dialogRef = this.matDialog.open(RoutesListDialogComponent, {
      ...this.getDefaultDialogConfig(),
      minWidth: '300px',
    });
    dialogRef.componentInstance.routeRepresentation = this.routeRepresentation;
    dialogRef.componentInstance.patterns = this.patterns;
    dialogRef.componentInstance.dataLoaded = true;
    this.dialogAfterCloseSubscription?.unsubscribe();
    this.dialogAfterCloseSubscription = dialogRef.afterClosed().subscribe(result => {
      const chosenRouteData: any[] | undefined = result?.data;
      if (chosenRouteData) {
        this.showRoute.emit(chosenRouteData);
      }
     });
  }
  public getDefaultDialogConfig(): MatDialogConfig {
    return {
      closeOnNavigation: true,
      autoFocus: 'dialog',
      exitAnimationDuration: '0ms',
      enterAnimationDuration: '0ms',
    };
  }
}