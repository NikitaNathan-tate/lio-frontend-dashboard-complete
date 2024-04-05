import {ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { Notifications } from '../../notifications';
import { NotificationType } from '../../enums/notifications-type.enums';
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  @Input() public notification!: Notifications;

  public readonly NotificationType = NotificationType;

  constructor() {
  }
}

