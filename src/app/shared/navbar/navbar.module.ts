import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MenubarModule } from '../menubar';
import { NotificationsModule } from '../notifications';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { PanelBarModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { ToolBarModule } from '@progress/kendo-angular-toolbar';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { NavigationModule } from "@progress/kendo-angular-navigation";
import { LabelModule } from "@progress/kendo-angular-label";
import { ReactiveFormsModule } from '@angular/forms';







@NgModule({
  declarations: [
    NavbarComponent
  ],
  exports: [
    NavbarComponent,
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatMenuModule,
    MatDividerModule,
    MenubarModule,
    NotificationsModule,
    MatIconModule,
    MatBadgeModule,
    PanelBarModule,
    PopupModule,
    ToolBarModule,
    DropDownListModule,
    FormsModule,
    NavigationModule,
    LabelModule,
    ReactiveFormsModule
],
})
export class NavbarModule {
}
