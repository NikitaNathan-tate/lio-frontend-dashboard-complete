import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CopyBaseVersionComponent } from './copy-base-version.component';

const routes: Routes = [
  { path: '', component: CopyBaseVersionComponent }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CopyBaseVersionRoutingModule { }
