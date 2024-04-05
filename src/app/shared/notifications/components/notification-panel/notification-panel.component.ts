import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { NotificationPanelService } from '../../notificationservice';
import { Notifications } from '../../notifications';
import { NotificationType } from '../../enums/notifications-type.enums';
import { Observable, of, delay,map } from 'rxjs';

@Component({
  selector: 'app-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent {
  public static readonly minWidth = '550px';
  public static readonly maxWidth = '50vw';
  public static readonly panelClass = 'notification-dialog';
  constructor(private notificationsService: NotificationPanelService) {
  
    this.getItems();
  }

 // public notifications$!: Observable<INotification[]>;
  public notifications$!: Observable<any> ;
  public items: any ;

  public ngOnInit(): void {
    this.getItems();
    // this.notifications$ = this.notificationsService.notifications$
    // .pipe(map(nl => nl.sort((n1, n2) => n2.datetime - n1.datetime)));
  }

  addItem(): void {
   // const newItem = { id: "1",notificationType : "notificationType"};
    const newItem: Notifications = {
      id: 1,
      text : "Application started",
      datetime : new Date().getTime(),
      type: NotificationType.Info
    };
    this.notificationsService.addItem(newItem);
   // this.newItemName = '';
    this.getItems();
  }

  getItems(): void {
    this.notificationsService.getAllItems().then((items) => {
      this.items = items;
       this.notifications$  = of(items).pipe(delay(100));
    });
  }
}
