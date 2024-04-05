import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
@NgModule({
    declarations: [
     
    ],
    exports: [
        
    ],
    imports: [
      CommonModule,
      
      RouterLink,
      MatButtonModule,
      MatTooltipModule,
      MatFormFieldModule,
      MatInputModule,
      MatRippleModule,
      MatMenuModule,
      MatDividerModule
  ],
  })
  
  export class MenubarModule {
}