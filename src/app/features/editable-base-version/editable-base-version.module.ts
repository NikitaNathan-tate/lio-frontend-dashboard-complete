import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { editableBaseVersionComponent } from './editable-base-version.component';
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
  declarations: [editableBaseVersionComponent],
  exports: [editableBaseVersionComponent]
})
export class EditableBaseVersionModule { }
