import { Injectable } from '@angular/core';
import { NotificationService } from '@progress/kendo-angular-notification';

@Injectable({
  providedIn: 'root',
})
export class UserNotificationService {
  constructor(private notificationService: NotificationService) {}
  public showDefault(msg): void {
    this.notificationService.show({
      content: msg,
      hideAfter: 600,
      position: { horizontal: 'right', vertical: 'top' },
      animation: { type: 'fade', duration: 900 },
      type: { style: 'none', icon: true },
    });
  }
  public showSuccess(msg): void {
    this.notificationService.show({
      content: msg,
      hideAfter: 600,
      position: { horizontal: 'center', vertical: 'top' },
      animation: { type: 'fade', duration: 900 },
      type: { style: 'success', icon: true },
    });
  }
  public showWarning(msg): void {
    this.notificationService.show({
      content: msg,
      hideAfter: 600,
      position: { horizontal: 'left', vertical: 'bottom' },
      animation: { type: 'fade', duration: 900 },
      type: { style: 'warning', icon: true },
    });
  }
  public showInfo(msg): void {
    this.notificationService.show({
      content: msg,
      hideAfter: 600,
      position: { horizontal: 'center', vertical: 'bottom' },
      animation: { type: 'fade', duration: 900 },
      type: { style: 'info', icon: true },
    });
  }
  public showError(msg): void {
    this.notificationService.show({
      content: msg,
      hideAfter: 600,
      position: { horizontal: 'right', vertical: 'bottom' },
      animation: { type: 'fade', duration: 900 },
      type: { style: 'error', icon: true },
    });
  }
}
