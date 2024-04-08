import {
  Component,
  OnInit,
  
} from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { BaseVersion } from './baseversions';
import { HttpClient } from '@angular/common/http';
import { HorizontalAlign, VerticalAlign } from '@progress/kendo-angular-layout';
import { stringifyClassObject } from '@progress/kendo-angular-dateinputs/util';
import {
  GuiTable,
  RootObject,
} from 'src/app/features/general-template/model/model';
import { StorageService } from 'src/app/storage/storageservice';
import { catchError, lastValueFrom, tap, throwError } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig.service';
import { MatDialog } from '@angular/material/dialog';
import { RecyclebinComponent } from 'src/app/features/dashboard/components/recyclebin/recyclebin.component';
import { CreatebaseversionComponent } from '../createbaseversion/createbaseversion.component';
import { ListItemModel } from '@progress/kendo-angular-buttons/listbutton/list-item-model';
import { ActivesessionService } from 'src/app/features/activesession';
import { UseractivitylogService } from 'src/app/features/useractivitylog/services/useractivitylog.service';
import { CenterPopupComponent } from 'src/app/shared/center-popup/center-popup.component';
import { UserSettingService } from 'src/app/services/userSetting.service';
import { UserNotificationService } from 'src/app/shared/usernotification/usernotification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FontSizeService } from 'src/app/services/FontSize.service';
import { nameValidator } from 'src/app/utilities/nameValidators';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  public baseVersions?: any;
  public editableBaseVersions?: any;
  public releaseBaseVersions?: any;
  public lastImportedBaseVersions?: any;
  public deletedBaseVersions: BaseVersion[];
  public deletedBaseVersionsCount: number = 0;
  public maxBaseVersionsCount: number;
  public recycleBinUsedPercentage: number = 0;
  selectedItemCountOfActiveSess: number = 0;
  activeSessionData: any;
  userActivityLogData: any;
  showCreateNewVersionPopup = false;
  showRecycleBinPopup = false;
  showCreateNewVersionSuccessPopup = false;
  showCreateNewVersionPopupContent=false
  userSettingData: Object;

  constructor(
    private readonly http: HttpClient,
    private router: Router,
    private dashboardService: DashboardService,
    public storageService: StorageService,
    private readonly matDialog: MatDialog,
    private activeSessionService: ActivesessionService,
    private useractivitylogService: UseractivitylogService,
    private userSettingService: UserSettingService,
    public userNotificationService:UserNotificationService,
  ) {}

  OpenContextMenu() {
    alert('Yet to implement');
  }

  public handleSelectionCount(count: any): void {
    this.selectedItemCountOfActiveSess = count;
  }

  goToCopyBaseVersion() {
    this.router.navigate(['/copy-base-version']);
  }

  onDropDownItemClick(e: any) {
    console.log("nikkkkkkkkkkkkkkkkkkkkk",e);
    
    const clickedItemText = e.text;

    switch (clickedItemText) {
      case 'Copy Base Version':
        this.copyBaseVersion();
        break;
      case 'Finalise':
        this.finalise();
        break;
      case 'Rename':
        this.rename();
        break;
      case 'Export Base Version':
        this.exportBaseVersion();
        break;
      case 'Delete':
        this.delete();
        break;
      default:
        console.warn('Unknown item clicked:', clickedItemText);
    }
  }

  private copyBaseVersion() {
    console.log('Copy Base Version clicked');
    this.router.navigate(['/dashboard/copybaseversion']);
    }

  private finalise() {
    console.log('Finalise clicked');
    // Implement your logic here
  }

  private rename() {
    console.log('Rename clicked');
    // Implement your logic here
  }

  private exportBaseVersion() {
    console.log('Export Base Version clicked');
    // Implement your logic here
  }

  private delete() {
    console.log('Delete clicked');
    // Implement your logic here
  }

  OpenRecycleBinDialog() {
    this.matDialog.open(RecyclebinComponent, {
      minWidth: RecyclebinComponent.minWidth,
      maxWidth: RecyclebinComponent.maxWidth,
      minHeight: RecyclebinComponent.minHeight,
      maxHeight: RecyclebinComponent.maxHeight,
      panelClass: RecyclebinComponent.panelClass,
      data: {
        recycleBinComponents: this.deletedBaseVersions,
      },
    });
  }

  OpenNewBaseVersionDialog() {
    this.matDialog.open(CreatebaseversionComponent, {
      minWidth: CreatebaseversionComponent.minWidth,
      maxWidth: CreatebaseversionComponent.maxWidth,
      minHeight: CreatebaseversionComponent.minHeight,
      maxHeight: CreatebaseversionComponent.maxHeight,
      panelClass: CreatebaseversionComponent.panelClass,
      // data: {
      //   recycleBinComponents: this.deletedBaseVersions,
      // },
    });
  }
  public ngOnInit(): void {
    const url: string =
      AppConfig.settings.apiUrl +
      '/baseversion' +
      AppConfig.settings.templateExtension;
    this.getData(url);
    this.fetchActiveSessionData();
    this.fetchUserActivityLog();
  }

  fetchActiveSessionData() {
    this.activeSessionService.fetchData().subscribe((a1) => {
      this.activeSessionData = a1;
    });
  }

  fetchUserActivityLog() {
    this.useractivitylogService.FetchData().subscribe((a1) => {
      this.userActivityLogData = a1;
    });
  }

  getQualityClass(quality: string): string {
    switch (quality) {
      case 'Ok':
        return 'green';
      case 'NotOk':
        return 'red';
      default:
        return 'grey'; // Default class or an empty string if no class is needed
    }
  }

  getStateClass(state: string): string {
    switch (state) {
      case 'Available':
        return 'green';
      case 'Editing':
        return 'orange';
      case 'Blocked':
        return 'red';
      default:
        return 'grey'; // Default class or an empty string if no class is needed
    }
  }

  getData(url: string) {
    this.http.get(url).subscribe((response) => {
      this.baseVersions = response;
      this.editableBaseVersions = this.FilterBV(
        'Editable',
        this.baseVersions
      ).sort(this.sortByVersionName);
      this.releaseBaseVersions = this.FilterBV(
        'Release',
        this.baseVersions
      ).sort(this.sortByIdDescending);
      this.lastImportedBaseVersions = this.FilterBV(
        'Import',
        this.baseVersions
      ).sort(this.sortByIdAescending);
      this.maxBaseVersionsCount = 20;
      if (
        this.baseVersions.filter((e) =>
          e.baseversiontype.includes('DeletedEditable')
        ).length > 0
      ) {
        this.deletedBaseVersionsCount = this.baseVersions.filter((e) =>
          e.baseversiontype.includes('DeletedEditable')
        ).length;
        this.recycleBinUsedPercentage =
          (this.deletedBaseVersionsCount * 100) / this.maxBaseVersionsCount;
        this.deletedBaseVersionsCount = this.baseVersions.filter((e) =>
          e.baseversiontype.includes('DeletedEditable')
        ).length;
        this.deletedBaseVersions = this.FilterBV(
          'DeletedEditable',
          this.baseVersions
        );
      }
    });
    this.FetchDefinitions();
  }

  sortByVersionName = (a, b) => {
    let nameA = a.baseversionsname.toUpperCase();
    let nameB = b.baseversionsname.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  };

  sortByIdDescending = (a, b) => {
    return b.bvnumber - a.bvnumber;
  };

  sortByIdAescending = (a, b) => {
    return a.bvnumber - b.bvnumber;
  };

  FilterBV(baseversiontype: string, baseVersions: any): any {
    return baseVersions
      .filter((e) => e.baseversiontype.includes(baseversiontype))
      .sort((a, b) =>
        a.baseversiontype.includes(baseversiontype) &&
        !b.baseversiontype.includes(baseversiontype)
          ? -1
          : b.baseversiontype.includes(baseversiontype) &&
            !a.baseversiontype.includes(baseversiontype)
          ? 1
          : 0
      );
  }
  public items = [...Array(15)];
  public hAlign: HorizontalAlign = 'stretch';
  public vAlign: VerticalAlign = 'stretch';
  public hAlignOptions = ['start', 'center', 'end', 'stretch'];
  public vAlignOptions = ['top', 'middle', 'bottom', 'stretch'];

  public hAlignChange(e: HorizontalAlign): void {
    this.hAlign = e;
  }

  public vAlignChange(e: VerticalAlign): void {
    this.vAlign = e;
  }

  public FetchDefinitions() {
    this.http
      .get(
        AppConfig.settings.apiUrl +
          '/columnDefinition' + AppConfig.settings.templateExtension
      )
      .pipe(
        tap((response: any) => {
          console.log('Response:', response);
          const tableStructures: GuiTable[] = response.GuiTables.map(
            (guiTable) => {
              const tableStructure = new GuiTable();
              tableStructure.Name = guiTable.Title.toLowerCase();
              tableStructure.TableName = guiTable.Name;
              tableStructure.Id = guiTable.Id; // Convert string to number
              tableStructure.Columns = guiTable.Columns;
              tableStructure.TableType = guiTable.TableType;
              tableStructure.ChildName = guiTable.ChildName;
              tableStructure.ChildTableName = guiTable.ChildTableName;
              tableStructure.Parameters = guiTable.Parameters;
              tableStructure.UsageTable = guiTable.UsageColumn;
              tableStructure.UsageColumn = guiTable.UsageColumn;
              tableStructure.WindowParameter = guiTable.UsageColumn;
              tableStructure.MapDisplay = guiTable.MapDisplay;
              this.storageService.addItem(
                tableStructure,
                'TableDefinition',
                guiTable.Name
              );
              console.log('Column definitions added');

              return tableStructure;
            }
          );
        }),
        catchError((error: any) => {
          console.error('Error:', error);
          return error;
        })
      )
      .subscribe();
    var currenturl =AppConfig.settings.apiUrl +
    '/profilesettings' +
    AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')  
      currenturl=currenturl+'/1';
    this.http
      .get(
        currenturl
      )
      .pipe(
        tap((response: any) => {
          console.log('Response:', response);
          for (const tableName in response) {
            if (response.hasOwnProperty(tableName)) {
              const tableData = {
                Name: tableName,
                columns: response[tableName],
              };
              this.storageService.addItem(tableData, 'UserSetting', tableName);
            }
          }
          console.log('Item Added');
          return response;
        }),
        catchError((error: any) => {
          console.error('Error:', error);
          return error;
        })
      )
      .subscribe();
  }
  onCreateNewBaseVersion() {
    console.log(this.form.value); 
    this.showCreateNewVersionPopup=true
    this.showCreateNewVersionPopupContent = false;
    this.showCreateNewVersionSuccessPopup = true;
    this.onCloseCreateNewBaseVersion();
    this.userNotificationService.showSuccess("New base version created successfully");
  }

  onCloseCreateNewBaseVersion() {
    this.showCreateNewVersionPopupContent = false;
    this.showCreateNewVersionPopup = false;
    this.showCreateNewVersionSuccessPopup = false;
  }


  openCreateVersion() {
    this.showCreateNewVersionPopup=true
    this.showCreateNewVersionPopupContent = true;
    this.showCreateNewVersionSuccessPopup = false;
  }

  closeCreateVersion() {
    this.showCreateNewVersionPopupContent = false;
    this.showCreateNewVersionPopup = false;
    this.showCreateNewVersionSuccessPopup = false;
  }

  openRecycledBaseVersion() {
    this.showRecycleBinPopup = true;
  }

  closeRecycledBaseVersion() {
    this.showRecycleBinPopup = false;
  }

 // Create a form group
  form = new FormGroup({ 
    baseVersion: new FormControl('',nameValidator)
  });
  public navigatePage(routeSegments: string[], bvName: string, bvNumber:number): void 
  {
      //this.storageService.removeItem('TableValue','0');
      this.GetRepresentations(bvNumber,1);
      this.GetRepresentations(bvNumber,2);
      this.GetRepresentations(bvNumber,0);
      this.GetLinkColumns(bvNumber);
      //const navigationExtras: NavigationExtras = {state: {example: bvName}};
      this.router.navigate([]).then(result => { 
          var redirectUrl = AppConfig.settings.angularSubDirUrl+`/` + routeSegments[0]+ '?bvNumber=' + bvNumber;
          const wnd= window.open( redirectUrl, '_blank'); 
          wnd.onload = function() {
              wnd.document.title = bvName;
            }
      });
  }
  private GetRepresentations(bvNumber:number,priority:number)
  {
      this.FetchRepresentations(bvNumber,priority).then(async (response) => {
          // fill the link columns
          console.log('Response:', response);
          for (const tableName in response) {
            if (response.hasOwnProperty(tableName)) {
              const tableData = {
                Name: tableName,
                columns: response[tableName]
              };
              this.storageService.addItem(tableData, 'Representation',tableName);
            }
          }
        });
  }
  async FetchRepresentations(bvNumber:number,priority:number)
  {
    var url = AppConfig.settings.apiUrl+'/recordrepresentation' + AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')
      url = url +'/'+bvNumber +'/'+priority;
    let response$ =  this.http.get(url);
    let response = await lastValueFrom(response$);
    return response;
  }

  private GetLinkColumns(bvNumber:number)
  {
      this.FetchLinks(bvNumber).then(async (response) => {
          // fill the link columns
          // console.log('Response:', response);
          // for (const tableName in response) {
          //   if (response.hasOwnProperty(tableName)) {
          //     const tableData = {
          //       Name: tableName,
          //       columns: response[tableName]
          //     };
          //     this.storageService.addItem(tableData, 'LinkColumn',tableName);
          //   }
          // }
        });
  }

  async FetchLinks(bvNumber:number)
  {
    var url = AppConfig.settings.apiUrl+'/linkcolumn' + AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')
      url = url +'/'+bvNumber;
    let response$ =  this.http.get(url);
    let response = await lastValueFrom(response$);
    return response;
  }
}
