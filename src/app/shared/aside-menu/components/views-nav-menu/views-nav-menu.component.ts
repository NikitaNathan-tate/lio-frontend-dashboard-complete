import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig.service';
import { GeneralTemplateService } from 'src/app/features/general-template/services/general-template.service';

@Component({
  selector: 'app-views-nav-menu',
  templateUrl: './views-nav-menu.component.html',
  styleUrls: ['./views-nav-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None // With OnPush buttons are sometimes incorrectly disabled
})

export class ViewsNavMenuComponent {
  @Output() public closeDrawer = new EventEmitter<void>();
  @Output() public openWindow = new EventEmitter<string>();
  selectedMenu :string;
  public uiVersion = "000DD600";
  menuItems = [
    {icon:'insert_chart', text: 'Stops',  showNavbar: true},
    {icon:'directions_bus', text: 'Stopping Points'},
    { text: 'Links'},
    { text: 'Layover Links'}
  ];
  
  items: any[] ;
  constructor(
    private readonly router: Router, private http: HttpClient, public generalTemplateService: GeneralTemplateService
  ) {
    
    var url: string = 'assets/mocks/menu.json';
    url = AppConfig.settings.apiUrl+'/MenuDefinition' + AppConfig.settings.templateExtension;
    this.http.get<any[]>(url).subscribe(data => 
      {
          this.items = data["GuiMenuItem"];
        });
  }

  public get currentYear(): string {
    return new Date().getFullYear().toString();
  }

  
  public navigateToPage(routeSegments: string[], clickEvent: MouseEvent, showNavbar = false): void 
  {    
    this.router.navigate([`${routeSegments}`]);  
    this.closeDrawer.emit();
  }
  
  openMenu(routeSegments: string[], clickEvent: MouseEvent, showNavbar = false) {
    if(routeSegments.length>0)
      {
        this.selectedMenu = routeSegments[0] ; 
        this.generalTemplateService.emitEvent({ message: this.selectedMenu });
      }
      this.closeDrawer.emit();
  }

  public onSelect({ item }): void {
    if (item.items && item.items.length<1) 
    {
      this.selectedMenu = item.Route ; 
      this.generalTemplateService.emitEvent({ message: this.selectedMenu });
    }
    this.closeDrawer.emit();
  }
}
