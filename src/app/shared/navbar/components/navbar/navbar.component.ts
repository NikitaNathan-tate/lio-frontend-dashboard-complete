import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { NotificationPanelComponent } from 'src/app/shared/notifications';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { PopupComponent } from '@progress/kendo-angular-popup';
import { FontSizeService } from 'src/app/services/FontSize.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserSettingService } from 'src/app/services/userSetting.service';
import { UserNotificationService } from 'src/app/shared/usernotification/usernotification.service';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @ViewChild('userProfileTrigger') userProfileTrigger: MatMenuTrigger;
  private closeUserProfileMenuTimer: any;
  @ViewChild('notificationTrigger') notificationTrigger: MatMenuTrigger;
  private closeMenuTimer: any;
  public toggleText = 'Hide';
  public show = false;
  settingsForm: FormGroup;

  @Input() public hamburgerMenuOpened = false;
  @Output() public hamburgerMenuToggle = new EventEmitter<void>();
  isMenuVisible: boolean = false;
  public dateFormats: Array<string> = [
    'dd/MM/yyyy',
    'dd.MM.yyyy',
    'yyyy-MM-dd',
  ];

  public timeFormats: Array<string> = ['HH:mm:ss', 'HH.mm.ss'];

  public fontSizes: Array<string> = ['10', '12', '14', '16', '18', '20'];

  public defaultMaps: Array<string> = [
    'Trapeze Geo Server',
    'Open Street Map',
  ];

  constructor(
    private fb: FormBuilder,
    private UserSettingService: UserSettingService,
    private router: Router,
    private readonly matDialog: MatDialog,
    public userNotificationService: UserNotificationService,
    private fontSizeService: FontSizeService,
    private eRef: ElementRef
  ) {}

  ngOnInit() {
    this.updateMenuVisibility();
    this.router.events.subscribe(() => {
      this.updateMenuVisibility();
    });

    this.UserSettingService.getSettings().subscribe((settings) => {
      this.settingsForm.patchValue(settings);
    });
    this.fetchUserSettings();
  }

  fetchUserSettings() {
    this.settingsForm = this.fb.group({
      TIMEFORMAT: [''],
      DEFAULTMAPINDEX: [''],
      DATEFORMAT: [''],
      FONTSIZEINDEX: [''],
    });

    this.UserSettingService.getSettings().subscribe((settings) => {
      this.settingsForm.patchValue(settings);
    });
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target) && this.show) {
      // If the click is outside of the component and the popup is open, close the popup
      this.show = false;
    }
  }

  onSubmit() {
    this.userNotificationService.showSuccess("user setting saved successfully");
    
    
    this.UserSettingService.saveSettings(this.settingsForm.value).subscribe(() => {
      this.userNotificationService.showSuccess("user setting saved successfully");
    });
    this.fontSizeService.setFontSize(this.settingsForm.value.FONTSIZEINDEX);
    this.show = false;
    
  }
  public onToggle(): void {
    this.show = !this.show;
    this.toggleText = this.show ? 'Hidе' : 'Show';
  }
  openUserProfileMenu() {
    clearTimeout(this.closeUserProfileMenuTimer);
    this.userProfileTrigger.openMenu();
  }

  closeUserProfileMenu() {
    if (this.userProfileTrigger.menuOpen) {
      this.userProfileTrigger.closeMenu();
    }
    this.closeUserProfileMenuTimer = setTimeout(() => {
      this.userProfileTrigger.closeMenu();
    }, 10000);
  }

  openNotificationMenu() {
    this.notificationTrigger.openMenu();
  }

  closeNotificationMenu() {
    if (this.notificationTrigger.menuOpen) {
      this.notificationTrigger.closeMenu();
    }
  }

  updateMenuVisibility() {
    this.isMenuVisible = this.router.url !== '/';
  }
  navigateDahboard() {
    this.router.navigate(['/']);
  }
}
