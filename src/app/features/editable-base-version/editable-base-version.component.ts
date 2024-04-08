import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListItemModel } from '@progress/kendo-angular-buttons';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig.service';
import { StorageService } from 'src/app/storage/storageservice';

@Component({
  selector: 'editable-base-version',
  templateUrl: './editable-base-version.component.html',
  styleUrls: ['./editable-base-version.component.css'],
})
export class editableBaseVersionComponent implements OnInit {
  @Input() editableBaseVersions: any;
  
  public baseVersionDropDownItems: ListItemModel[] = [
    {
      text: 'Copy Base Version',
    },
    {
      text: 'Finalise',
    },
    {
      text: 'Rename',
    },
    {
      text: 'Export Base Version',
    },
    {
      text: 'Delete',
    },
  ];

  constructor(
    private router: Router,
    public storageService: StorageService,
    private readonly http: HttpClient
  ) {}

  ngOnInit() {}
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

  public navigatePage(
    routeSegments: string[],
    bvName: string,
    bvNumber: number
  ): void {
    //this.storageService.removeItem('TableValue','0');
    this.GetRepresentations(bvNumber, 1);
    this.GetRepresentations(bvNumber, 2);
    this.GetRepresentations(bvNumber, 0);
    this.GetLinkColumns(bvNumber);
    //const navigationExtras: NavigationExtras = {state: {example: bvName}};
    this.router.navigate([]).then((result) => {
      var redirectUrl =
        AppConfig.settings.angularSubDirUrl +
        `/` +
        routeSegments[0] +
        '?bvNumber=' +
        bvNumber;
      const wnd = window.open(redirectUrl, '_blank');
      wnd.onload = function () {
        wnd.document.title = bvName;
      };
    });
  }
  private GetRepresentations(bvNumber: number, priority: number) {
    this.FetchRepresentations(bvNumber, priority).then(async (response) => {
      // fill the link columns
      console.log('Response:', response);
      for (const tableName in response) {
        if (response.hasOwnProperty(tableName)) {
          const tableData = {
            Name: tableName,
            columns: response[tableName],
          };
          this.storageService.addItem(tableData, 'Representation', tableName);
        }
      }
    });
  }

  async FetchRepresentations(bvNumber: number, priority: number) {
    var url =
      AppConfig.settings.apiUrl +
      '/recordrepresentation' +
      AppConfig.settings.templateExtension;
    if (AppConfig.settings.templateExtension == '')
      url = url + '/' + bvNumber + '/' + priority;
    let response$ = this.http.get(url);
    let response = await lastValueFrom(response$);
    return response;
  }
  private GetLinkColumns(bvNumber: number) {
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
  async FetchLinks(bvNumber: number) {
    var url =
      AppConfig.settings.apiUrl +
      '/linkcolumn' +
      AppConfig.settings.templateExtension;
    if (AppConfig.settings.templateExtension == '') url = url + '/' + bvNumber;
    let response$ = this.http.get(url);
    let response = await lastValueFrom(response$);
    return response;
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
}
