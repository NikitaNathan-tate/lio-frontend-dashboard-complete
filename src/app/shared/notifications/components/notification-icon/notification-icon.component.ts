 
import {  ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    OnDestroy,
    OnInit,
    Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationPanelService } from 'src/app/shared/notifications/notificationservice';

@Component({
  selector: 'app-notification-icon',
  templateUrl: './notification-icon.component.html',
  styleUrls: ['./notification-icon.component.scss']
})
export class NotificationIconComponent {
  public notificationsQty = 1;
  @Output() public openNotificationsPanel = new EventEmitter<void>();
  public notificationsSubscription?: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private notificationsService: NotificationPanelService) {
  }
  public onNotificationsIconClick(notificationsQty?: number): void {
    this.openNotificationsPanel.emit();
  }

  
  public ngOnInit(): void {
    this.notificationsService.getAllItems();
    this.notificationsSubscription = this.notificationsService.notifications1$
      .subscribe(nl => {
        this.cdr.markForCheck();
        this.notificationsQty = nl;
      });
  }

  getItems(): void {
    this.notificationsService.getAllItems().then((items) => {
      this.notificationsQty = items.length;
    });
  }
}
