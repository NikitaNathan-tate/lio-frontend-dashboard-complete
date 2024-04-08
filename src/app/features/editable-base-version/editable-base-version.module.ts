import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { editableBaseVersionComponent } from './editable-base-version.component';
import { GridModule } from '@progress/kendo-angular-grid';
import {MatIconModule} from '@angular/material/icon';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { CenterPopupModule } from "../../shared/center-popup/center-popup.component";
import { CopyBaseVersionModule } from "../copy-base-version/copy-base-version.module";





@NgModule({
    declarations: [editableBaseVersionComponent],
    exports: [editableBaseVersionComponent],
    imports: [
        CommonModule,
        GridModule,
        MatIconModule,
        ButtonsModule,
        CenterPopupModule,
        CopyBaseVersionModule
    ]
})
export class EditableBaseVersionModule { }
