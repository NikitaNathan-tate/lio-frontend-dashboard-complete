import { Component, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ListItemModel } from '@progress/kendo-angular-buttons';
import { AppConfig } from 'src/app/AppConfig.service';
@Component({
    selector: 'baseversion-list-item',
    template: `
     <link
      rel="stylesheet"
      href="https://unpkg.com/@progress/kendo-font-icons/dist/index.css"
    />
        <div>
                            <div class="description">
                              <div class="flex-container">
                                <div  style="font-size:14px;">
                                  {{ baseversion.bvnumber }} &nbsp;<b>{{ baseversion.baseversionsname }}</b>
                                </div>
                                <div>
                                    <div kendoTooltip>
                                    <button kendoButton (click)="navigatePage(['menu'],baseversion.baseversionsname,baseversion.bvnumber)" icon= "zoom" fillMode="flat" title="View"></button>
                                    <button kendoButton (click)="navigatePage(['menu'],baseversion.baseversionsname,baseversion.bvnumber )" icon= "edit" title="Edit" fillMode="flat"  ></button>
                                    <button kendoButton (click)="goToPage('stops')" icon= "trash" title="Delete" fillMode="flat"   ></button>
                                   <kendo-dropdownbutton kendoButton fillMode="flat" size="small" icon="arrow-60-down"  [data]="baseVersionDropDownItems">
                                    </kendo-dropdownbutton>
                                </div>
                                </div>
                              </div>
                              <div style="font-size: 12px;">
                                Quality Ok&nbsp;&nbsp;&nbsp;State {{ baseversion.baseversionsiseditable ? 'Is Edited' : 'Is Not Editable' }}
                              </div>
                            </div>
                          </div>

    `,
   styleUrls: ['./dashboard.component.scss']
})
export class BaseVersionListItemComponent {

    constructor(private router: Router) { }
    @Input() public baseversion: {
        baseversionsid: number ;
        bvnumber: number ;
        baseversionsname: string ;
        baseversionsiseditable: boolean;
    };
    
    goToPage(pageName:string){
        this.router.navigate([`${pageName}`]);}

        public navigateToPage(routeSegments: string[]): void
        {
            const url = [window.location.origin, ...routeSegments].join('/');
            const settings = `toolbar=0,location=0,menubar=0,directories=no,status=no,titlebar=no,alwaysRaised=yes,width=${ 1200 },height=${ 800 }`;
            const openedWindow = window.open(url);//, '_blank', settings);
            openedWindow?.sessionStorage.setItem('noNavbar', JSON.stringify(false));
        }
        public navigatenewwindow(routeSegments: string[]) :void 
        {
            this.router.navigate([]).then(result => {  window.open(AppConfig.settings.angularSubDirUrl+ `/` + routeSegments[0], '_blank'); });

        }
        public navigatePage(routeSegments: string[], bvName: string, bvNumber:number): void 
        {
            //const navigationExtras: NavigationExtras = {state: {example: bvName}};
            this.router.navigate([]).then(result => { 
                var redirectUrl = AppConfig.settings.angularSubDirUrl+`/` + routeSegments[0]+ '?bvNumber=' + bvNumber;
                const wnd= window.open( redirectUrl, '_blank'); 
                wnd.onload = function() {
                    wnd.document.title = bvName;
                 }
            });
        }
          public baseVersionDropDownItems: ListItemModel[] = [
          {
              text: 'View',
              click: (dataItem) => {this.router.navigate(['menu']);}
          },
          {
              text: 'Edit',
              click: (dataItem) => {
                //const navigationExtras: NavigationExtras = {state: {example: this.baseversion.baseversionsname}};
                this.router.navigate(['menu']);}
          },
          {
              text: 'Rename',
          },
          {
            text: 'Export Base Version',
          },
          {
              text: 'Copy Base Version',
              disabled: false,
              click: (dataItem) => {this.navigatePage(['copybv'],"Copy Base Version",0);},
          },
          {
              text: 'Import VDV Data',
              disabled: true,
          },
          {
              text: 'Import VDV Data',
              disabled: true,
          },
          {
              text: 'Import NetEx Data',
              disabled: true,
          },
          {
              text: 'Import Tariff Data',
              disabled: true,
          },
      ];

}

