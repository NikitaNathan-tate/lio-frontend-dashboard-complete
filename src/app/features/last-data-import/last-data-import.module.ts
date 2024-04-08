import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LastDataImportComponent } from './last-data-import.component';
import { GridModule } from '@progress/kendo-angular-grid';
import {MatIconModule} from '@angular/material/icon';
import { ButtonsModule } from '@progress/kendo-angular-buttons';


@NgModule({
  imports: [
    CommonModule,
    GridModule,
    MatIconModule,
    ButtonsModule
  ],
  declarations: [LastDataImportComponent],
  exports:[LastDataImportComponent]
})
export class LastDataImportModule { }
