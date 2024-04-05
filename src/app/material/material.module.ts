import { NgModule } from "@angular/core";
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';




const MaterialComponents = [
    MatSidenavModule,
    MatGridListModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule
]

@NgModule({
  exports: [
    MaterialComponents
  ],
  imports: [
    MaterialComponents
  ],
})
export class MaterialModule {}

