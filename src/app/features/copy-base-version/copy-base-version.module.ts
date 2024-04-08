import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyBaseVersionComponent } from './copy-base-version.component';
import { CopyBaseVersionRoutingModule } from './copy-base-version-routing.module';
import { NavigationModule } from "@progress/kendo-angular-navigation";
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from "@progress/kendo-angular-layout";
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { CenterPopupModule } from "../../shared/center-popup/center-popup.component";



@NgModule({
    declarations: [CopyBaseVersionComponent],
    imports: [
        CommonModule,
        CopyBaseVersionRoutingModule,
        NavigationModule,
        MatIconModule,
        LayoutModule,
        ProgressBarModule,
        CenterPopupModule
    ]
})
export class CopyBaseVersionModule { }
