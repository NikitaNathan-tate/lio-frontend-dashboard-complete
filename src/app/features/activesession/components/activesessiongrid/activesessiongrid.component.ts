import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivesessionService } from '../../services';
import { ActiveSession } from '../activesession/activesession';
import { StorageService } from 'src/app/storage/storageservice';
import { GridComponent, GridSize } from '@progress/kendo-angular-grid';
import { ButtonSize } from '@progress/kendo-angular-buttons';
import { CustomDialogComponentComponent } from 'src/app/shared/custom-dialog.component/custom-dialog.component';
import { AppConfig } from 'src/app/AppConfig.service';


@Component({
  selector: 'app-activesessiongrid',
  templateUrl: './activesessiongrid.component.html',
  styleUrls: ['../activesession/activesession.component.scss']
})
export class ActivesessiongridComponent implements OnInit {
  public static readonly minWidth = '550px';
  public static readonly maxWidth = '65vw';
  public static readonly minHeight = '350px';
  public static readonly maxHeight = '65vw';
  public static readonly panelClass = 'notification-dialog';

  public activeSessions?: ActiveSession[];
  public selectedRows?: number[] = [];
  public columns: any;
  public openMessageDialog = false;
  public openInfoDialog = false;

  public smallSize: GridSize = 'small';
  public message : string
  public size: ButtonSize = "small";
  @ViewChild(GridComponent) grid: GridComponent;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,private http: HttpClient, private activeSessionService: ActivesessionService, public storageService: StorageService,
    public dialogRef: MatDialogRef<ActivesessiongridComponent>,
  ) {
    this.activeSessions = this.data.activeSessions;
    this.message = "Sccue"
  }
  public ngOnInit(): void {
    const url: string = 'assets/mocks/activesession.json';
    this.SetColumns()
  }
  SetColumns(): any {
    this.columns = [];
    this.storageService.getRequiredItem('activesessions', 'TableDefinition').then((columns) => {
      this.columns = columns[0].Columns;
    });
  }
  public RemoveSelectedSessions(): void {

    if (this.selectedRows.length > 0)
    {
      this.message = "Would you like to reset the selected sessions listed above? The connected users will loose their connection and all process-related sessions will be removed. Be aware, if there are some processes running in the background, they will not be stopped"
      this.openMessageDialog = true;
    }
    else 
    {
      this.message = "Atleast one row must be selected"
      this.openInfoDialog = true;
    }
  }
  SelectedKeysChange(rows: any) {
    this.selectedRows = rows;
  }
  onSelectionChange(selection: any) {
    if (selection.selectedRows.length > 0)
      this.selectedRows.push(selection.selectedRows[0].dataItem.sessionindex);

    if (selection.deselectedRows.length > 0) {
      let sessionIndex: number = selection.deselectedRows[0].dataItem.sessionindex;
      const indexToRemove = this.selectedRows.indexOf(sessionIndex);
      if (indexToRemove !== -1) {
        this.selectedRows.splice(indexToRemove, 1);
      }
    }
  }
  CloseSessions() {
    this.dialogRef.close();
  }

  getData() {
    this.activeSessionService.fetchData().subscribe(a1 => {
      this.activeSessions = a1
    });
  }

private RemoveSession()
{
  let sessionIds: number[]=[];
  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json', // Set the Content-Type header to JSON
    }),
  };
  this.http.post(AppConfig.settings.apiUrl + '/' + 'ActiveSessions' + '/' + 1, this.selectedRows, httpOptions)
  .subscribe(
    (response: any) => {
      this.activeSessions = response ;
    },
    (error) => {
      console.log('Unexpected response:', error);
    }
  )
}
  public close(status: string): void {
    console.log(`Dialog result: ${status}`);
    if(status == "yes")
    alert("Remove from DB to be implmented")
    this.openMessageDialog = false;
  }

 public onYesButtonClick()
 {
    this.openMessageDialog = false;
    this.RemoveSession();
 }

  public onNoButtonClick()
  {
    this.openMessageDialog = false;
    this.dialogRef.close();
  }
  public open(): void {
    this.openMessageDialog = true;
  }
}
