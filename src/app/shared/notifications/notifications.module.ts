import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { NotificationIconComponent , NotificationComponent, NotificationPanelComponent } from './components';

@NgModule({
   declarations: [ NotificationIconComponent, NotificationPanelComponent, NotificationComponent],
   exports: [NotificationIconComponent, NotificationPanelComponent, NotificationComponent],
   imports: [CommonModule, MatBadgeModule, MatButtonModule, MatDividerModule, MatRippleModule],
})
export class NotificationsModule {
}
