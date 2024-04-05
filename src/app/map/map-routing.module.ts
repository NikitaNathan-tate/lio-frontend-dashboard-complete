import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapPageComponent } from './components/map-page/map-page.component';
import { MapResolvers } from './interfaces/resolve-map-data.interface';
//import { SelectedStopResolver } from './resolvers/selected-stop.resolver';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  component: MapPageComponent,
  resolve: {
    
  } as MapResolvers,
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MapRoutingModule {
}
