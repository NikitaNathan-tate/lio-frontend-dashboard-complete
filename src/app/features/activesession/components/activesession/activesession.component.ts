import {
  Input,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  OnChanges,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from '@angular/core';
import { ActivesessionService } from '../../services';
import { fromEvent, map, Observable, startWith, Subscription, tap } from 'rxjs';
import { ActiveSession } from './activesession';
import { ACTIVESESSION_TABLE_SERVICE } from '../../activesession.module.types';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ActivesessiongridComponent } from '../activesessiongrid/activesessiongrid.component';
import { AppConfig } from 'src/app/AppConfig.service';
import { StorageService } from 'src/app/storage/storageservice';

@Component({
  selector: 'app-activesession',
  templateUrl: './activesession.component.html',
  styleUrls: ['./activesession.component.scss'],
})
export class ActivesessionComponent implements OnInit {
  @Input() height: number = 400;
  @Input() dataSource: any = null;
  @Output() selectionCount = new EventEmitter<number>();
  public activeSessions?: ActiveSession[];
  public selectedKeys: any[] = [];
  selectedCount: Number = 0;
  public userInfo: any;
  public mockedActiveSessions?: ActiveSession[];
  public columns: any;

  constructor(
    public storageService: StorageService,
    private readonly matDialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.SetColumns();
  }

  public onSelectionChange(e: any): void {

    if (e.selectedRows) {
      e.selectedRows.forEach((row: any) => {
        // console.log(row);
        
        const dataItem = row.dataItem;
        const selectedIndex = this.selectedKeys.indexOf(dataItem.primarykeyduid);
        if (selectedIndex === -1) {
          this.selectedKeys.push(dataItem.ProductID);
        }
      });
    }
    if (e.deselectedRows) {
      e.deselectedRows.forEach((row: any) => {
        const dataItem = row.dataItem;
        const deselectedIndex = this.selectedKeys.indexOf(dataItem.primarykeyduid);
        if (deselectedIndex !== -1) { // If found, remove from selectedKeys
          this.selectedKeys.splice(deselectedIndex, 1);
        }
      });
    }
    this.selectionCount.emit(this.selectedKeys.length);
    
  }
  


  public openActiveSessionDialog(): void {
    this.matDialog.open(ActivesessiongridComponent, {
      minWidth: ActivesessiongridComponent.minWidth,
      maxWidth: ActivesessiongridComponent.maxWidth,
      minHeight: ActivesessiongridComponent.minHeight,
      maxHeight: ActivesessiongridComponent.maxHeight,
      panelClass: ActivesessiongridComponent.panelClass,
      data: {
        activeSessions: this.dataSource,
      },
    });
  }

  ngOnChanges(changes: any) {}

  SetColumns(): any {
    this.columns = [];
    this.storageService
      .getRequiredItem('activesessions', 'TableDefinition')
      .then((columns) => {
        this.columns = columns[0].Columns;
      });
  }
  public setStyles(): any {
    let styles = {
      height: this.height - 45 + 'px',
    };

    return styles;
  }
}
