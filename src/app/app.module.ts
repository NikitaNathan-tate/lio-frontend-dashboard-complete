import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component';
import { MenubarComponent } from './shared/menubar/components/menubar/menubar.component';
import { ActiveSession } from './features/activesession/components/activesession/activesession';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { MatDividerModule } from '@angular/material/divider';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { BaseVersionListItemComponent } from './features/dashboard/components/dashboard/baseversion-list-item.component';
import { AsideMenuModule } from './shared/aside-menu';
import { AppRoutingModule } from './app-routing.module';
import { ActivesessionComponent } from './features/activesession';
import { GridModule } from '@progress/kendo-angular-grid';
import { HttpClientModule ,HttpClientJsonpModule } from '@angular/common/http';
import { StopsComponent } from './features/networkdata/components/stops/stops.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { UseractivitylogComponent } from './features/useractivitylog/components/useractivitylog/useractivitylog.component';
import { GeneralTemplateComponent } from './features/general-template/general-template/general-template.component';
import { ToolBarModule } from '@progress/kendo-angular-toolbar';
import { ActivesessiongridComponent } from './features/activesession/components/activesessiongrid/activesessiongrid.component';
import { MatDialogModule } from '@angular/material/dialog';
import { LabelModule } from '@progress/kendo-angular-label';
import { TooltipModule, TooltipsModule } from '@progress/kendo-angular-tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import { CopybvComponent } from './features/copybv/components/copybv/copybv.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { ProgressBarModule } from '@progress/kendo-angular-progressbar'; 
import { PopupModule } from '@progress/kendo-angular-popup';
import { WindowModule, DialogModule } from "@progress/kendo-angular-dialog";
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { EditService } from './features/general-template/services/edit.service';
import { CustomPasteDirective } from './directive/custom-paste.directive';
import { GridContextMenuComponent } from './shared/contextmenu/grid-context-menu/grid-context-menu.component';
import { ExcelModule,PDFModule } from '@progress/kendo-angular-grid';
import { DetailComponent } from './features/nestedgrid/childgrid/child.component';
import { TestComponent } from './test/test.component';
import { AppConfig } from './AppConfig.service';
import { StorageService } from './storage/storageservice';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomSpinnerComponent } from './custom-spinner/custom-spinner.component'; // Import MatProgressSpinnerModule
import { CommonModule } from '@angular/common';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ChildGridContextMenuComponent } from './shared/contextmenu/childgrid-context-menu/childgrid-context-menu.component';
import { PopupAnchorDirective } from './features/nestedgrid/popup.anchor-target.directive';
import { MenuModule } from '@progress/kendo-angular-menu';
import { NotificationModule } from "@progress/kendo-angular-notification";
import { InCellTabDirective } from  './directive/incell-tab.directive';
import { MapComponent } from './map/components/map/map.component';
import { ZoomPanelComponent } from './map/components/zoom-panel/zoom-panel.component';
import { MapPageComponent } from './map/components/map-page/map-page.component';
import { CustomDialogComponentComponent } from './shared/custom-dialog.component/custom-dialog.component';
import { RecyclebinComponent } from './features/dashboard/components/recyclebin/recyclebin.component';
import { CreatebaseversionComponent } from './features/dashboard/components/createbaseversion/createbaseversion.component'; 
import { ObjectsQuickInfoComponent } from './map/components/objects-quick-info/objects-quick-info.component';
import { ShowRouteBtnComponent } from './map/components/show-route-btn/show-route-btn.component';
import { RoutesListDialogComponent } from './map/components/routes-list-dialog/routes-list-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ScrollingModule} from '@angular/cdk/scrolling';
import { MatInputModule } from '@angular/material/input';
import { MaterialModule } from './material/material.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CenterPopupModule } from "./shared/center-popup/center-popup.component";
import { EditableBaseVersionModule } from "./features/editable-base-version/editable-base-version.module";
import { ReleasedBaseVersionModule } from "./features/released-base-version/released-base-version.module";
import { LastDataImportModule } from "./features/last-data-import/last-data-import.module";

export function initializeApp(appConfig: AppConfig,storageService : StorageService) {
  return () => appConfig.load();
}
@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        ActivesessionComponent,
        MenubarComponent,
        StopsComponent,
        BaseVersionListItemComponent,
        UseractivitylogComponent,
        GeneralTemplateComponent,
        ActivesessiongridComponent,
        CopybvComponent,
        CustomPasteDirective,
        GridContextMenuComponent,
        DetailComponent,
        TestComponent,
        CustomSpinnerComponent,
        ChildGridContextMenuComponent,
        PopupAnchorDirective, InCellTabDirective, MapComponent, ZoomPanelComponent,
        MapPageComponent, CustomDialogComponentComponent, CreatebaseversionComponent,
        RecyclebinComponent, ObjectsQuickInfoComponent, ShowRouteBtnComponent, RoutesListDialogComponent
    ],
    providers: [EditService,
        AppConfig,
        { provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppConfig], multi: true }
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule, CommonModule,
        AppRoutingModule,
        MatTableModule,
        NavbarModule,
        MatMenuModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        MatSidenavModule,
        ButtonsModule,
        MatDividerModule,
        InputsModule,
        LayoutModule,
        ListViewModule,
        GridModule,
        AsideMenuModule,
        HttpClientModule, HttpClientJsonpModule,
        DropDownsModule,
        ToolBarModule,
        MatDialogModule,
        LabelModule,
        TooltipModule,
        TooltipsModule,
        MatTooltipModule,
        MatIconModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        ProgressBarModule,
        PopupModule,
        WindowModule,
        DialogModule,
        ScrollViewModule, ExcelModule, PDFModule, PDFExportModule, MenuModule, NotificationModule,
        ClipboardModule, MatFormFieldModule, ScrollingModule, MatInputModule,
        MatCardModule,
        MatListModule,
        MatButtonModule,
        MatProgressBarModule,
        CenterPopupModule,
        EditableBaseVersionModule,
        ReleasedBaseVersionModule,
        LastDataImportModule
    ]
})
export class AppModule { }
function executor(resolve: (value: unknown) => void, reject: (reason?: any) => void): void {
  throw new Error('Function not implemented.');
}

