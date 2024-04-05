import { Component } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Lio-Data';
public version : string = '000DD600';
public revision : string = 'r61888';
public year : string = '2023';

constructor()
{}
  public toggleViewsMenuDrawer(viewsMenuDrawer: MatDrawer): void {
    
    viewsMenuDrawer.toggle().finally();
  }
  
}
