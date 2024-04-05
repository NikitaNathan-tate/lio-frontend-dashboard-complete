import { Component, Inject, ViewChild } from '@angular/core';
import { ButtonSize } from '@progress/kendo-angular-buttons';
import { GridComponent, GridSize } from '@progress/kendo-angular-grid';
import { BaseVersion } from '../dashboard/baseversions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/AppConfig.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ListInformation } from '../../../general-template/model/model';
import { CustomDialogComponentComponent } from 'src/app/shared/custom-dialog.component/custom-dialog.component';

@Component({
  selector: 'app-recyclebin',
  templateUrl: './recyclebin.component.html',
  styleUrls: ['./recyclebin.component.scss']
})
export class RecyclebinComponent {
  public static readonly minWidth = '350px';
  public static readonly maxWidth = '35vw';
  public static readonly minHeight = '350px';
  public static readonly maxHeight = '65vw';
  public static readonly panelClass = 'notification-dialog';

  public recycleBinComponents?: BaseVersion[];
  public selectedRows?: number[] = [];
  public columns: any;
  public openMessageDialog = false;
  public openInfoDialog = false;
  public isConfirmationDialog : boolean
  public smallSize: GridSize = 'small';
  public message: string
  public size: ButtonSize = "small";
  @ViewChild(GridComponent) grid: GridComponent;
  @ViewChild(CustomDialogComponentComponent) customDialogComponent!: CustomDialogComponentComponent; // Get a reference to the child component

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private router: Router,private http: HttpClient, public dialogRef: MatDialogRef<RecyclebinComponent>,) {
    this.recycleBinComponents = this.data.recycleBinComponents;

}
  public navigatePage(routeSegments: string[], bvName: string, bvNumber: number): void
  {
    this.dialogRef.close();

    //const navigationExtras: NavigationExtras = {state: {example: bvName}};
    this.router.navigate([]).then(result => {
      var redirectUrl = AppConfig.settings.angularSubDirUrl + `/` + routeSegments[0] + '?bvNumber=' + bvNumber;
      const wnd = window.open(redirectUrl, '_blank');
      wnd.onload = function () {
        wnd.document.title = bvName;
      }
    });
  }
restorebv(bvNumber: number)
{
  alert("The selected BV is " + bvNumber)
}
deletebv(bvNumber: number)
{
  alert("The selected BV is " + bvNumber)
}
EmptyRecycleBin()
{
  this.message = "Would you like to empty the recycle bin "
  this.openMessageDialog = true;
  this.isConfirmationDialog = true;

}
Cancel()
{ 
  this.dialogRef.close();
}
onYesButtonClick()
{
  this.customDialogComponent.ngOnInit()
  this.openMessageDialog = false;
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
  this.http.post(AppConfig.settings.apiUrl + '/' + 'Baseversion' + '/' + 1, listInformation, httpOptions)
    .subscribe(
      (response: any) => {
        this.recycleBinComponents = response;
      },
      (error) => {
        console.log('Unexpected response:', error);
      }
    )
}

onNoButtonClick()
{
  this.openMessageDialog = false;
}
}
