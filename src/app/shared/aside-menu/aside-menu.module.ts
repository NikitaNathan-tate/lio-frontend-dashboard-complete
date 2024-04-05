import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MenuModule } from '@progress/kendo-angular-menu';
import { ViewsNavMenuComponent } from './components';


@NgModule({
  declarations: [
    ViewsNavMenuComponent
  ],
  exports: [
    ViewsNavMenuComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    A11yModule,
    RouterLink,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatBadgeModule,
    MenuModule
  ],
})
export class AsideMenuModule {
}
