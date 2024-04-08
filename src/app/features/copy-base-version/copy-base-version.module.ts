import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyBaseVersionComponent } from './copy-base-version.component';
import { CopyBaseVersionRoutingModule } from './copy-base-version-routing.module';
import { NavigationModule } from "@progress/kendo-angular-navigation";
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from "@progress/kendo-angular-layout";
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { CenterPopupModule } from "../../shared/center-popup/center-popup.component";
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';




@NgModule({
    declarations: [CopyBaseVersionComponent],
    imports: [
        CommonModule,
        CopyBaseVersionRoutingModule,
        NavigationModule,
        LabelModule,
        MatIconModule,
        LayoutModule,
        ProgressBarModule,
        CenterPopupModule,
        ReactiveFormsModule,
        InputsModule,
        ButtonsModule,
        ScrollViewModule
        
    ],
    exports: [CopyBaseVersionComponent]
})
export class CopyBaseVersionModule { }
