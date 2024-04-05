import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { ButtonSize } from '@progress/kendo-angular-buttons';
import { GridComponent, GridSize } from '@progress/kendo-angular-grid';
import { AppConfig } from 'src/app/AppConfig.service';
import { BaseVersion } from '../dashboard/baseversions';
import { MatDialog } from '@angular/material/dialog';
import { ListInformation } from 'src/app/features/general-template/model/model';
 
@Component({
  selector: 'app-createbaseversion',
  templateUrl: './createbaseversion.component.html',
  styleUrls: ['./createbaseversion.component.scss']
})
export class CreatebaseversionComponent {
  public static readonly minWidth = '350px';
  public static readonly maxWidth = '35vw';
  public static readonly minHeight = '350px';
  public static readonly maxHeight = '65vw';
  public static readonly panelClass = 'notification-dialog';
  public loading: boolean = false;

  public recycleBinComponents?: BaseVersion[];
  public selectedRows?: number[] = [];
  public columns: any;
  public openMessageDialog = false;
  public openInfoDialog = false;

  public smallSize: GridSize = 'small';
  public message: string
  public size: ButtonSize = "small";
  @ViewChild(GridComponent) grid: GridComponent;

  constructor(private http: HttpClient,
    private readonly matDialog: MatDialog,
  ) {
  }
  onYesButtonClick() {
    this.openMessageDialog = true;

    var listInformation = new ListInformation();
    listInformation.modetype = 2;
    listInformation.keys = this.recycleBinComponents.map(item => item.bvnumber)

    const baseversionsIds: number[] = this.recycleBinComponents.map(item => item.bvnumber);
    let sessionIds: number[] = [];
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', // Set the Content-Type header to JSON
      }),
    };
    this.http.post(AppConfig.settings.apiUrl + '/' + 'CreateBaseversion' + '/' + 1, listInformation, httpOptions)
      .subscribe(
        (response: any) => {
          this.recycleBinComponents = response;
        },
        (error) => {
          console.log('Unexpected response:', error);
        }
      )
  }
  CreateBV() {
    this.loading = true
  }
  Close() {
    this.matDialog.closeAll();

  }

  onNoButtonClick() {

  }
}
