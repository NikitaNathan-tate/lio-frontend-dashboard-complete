import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { MenubarComponent } from './shared/menubar/components';
import { StopsComponent } from './features/networkdata/components/stops/stops.component';
import { CopybvComponent } from './features/copybv/components/copybv/copybv.component';
import { TestComponent } from './test/test.component';
import { MapComponent } from './map/components/map/map.component';
import { MapPageComponent } from './map/components/map-page/map-page.component';
const routes: Routes = [  
  {
    path: '',    
    component:DashboardComponent
  },
  {
    path: 'dashboard',    
    component:DashboardComponent
  },
  {
    path: 'dashboard/copybaseversion',
    loadChildren: () => import('../app/features/copy-base-version/copy-base-version.module').then(m => m.CopyBaseVersionModule)
  },
  {
    path: 'menu',
    component:MenubarComponent
  },
  {
    path: 'copybv',
    component:CopybvComponent
  },
  {
    path: 'stops',
    component:StopsComponent
  },
  {
    path: 'stoppoints',
    component:MenubarComponent
  },
  {
    path: 'links',
    component:MenubarComponent
  },
  {
    path: 'layoverlinks',
    component:MenubarComponent
  } ,
  {
    path: 'stoppoints1',
    component:TestComponent
  } ,
  {
    path: 'geoeditor',
    component:MapPageComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
