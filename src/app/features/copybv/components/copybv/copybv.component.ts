import { Component, Input, ViewEncapsulation } from '@angular/core';
import { StepperActivateEvent } from '@progress/kendo-angular-layout';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LabelSettings } from '@progress/kendo-angular-progressbar';
import { NotificationPanelService } from 'src/app/shared/notifications/notificationservice';
import { Notifications } from 'src/app/shared/notifications/notifications';
import { NotificationType } from 'src/app/shared/notifications/enums/notifications-type.enums';
import {
  arrowLeftIcon,
  chevronLeftIcon,
  chevronRightIcon,
  SVGIcon,
} from '@progress/kendo-svg-icons';
@Component({
  selector: 'app-copybv',
  templateUrl: './copybv.component.html',
  styleUrls: ['./copybv.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class CopybvComponent {
  public value = 10;
  public items: any =[
   {
    message: [
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started1 \n',
      'Task under progress2 \n',
      'Task completed3  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress12 \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed  \n',
      'Task started \n',
      'Task under progress \n',
      'Task completed1  \n',
    ],
   },
   ];
  public width = '100%';
  public height = '374px';
  public label: LabelSettings = {
    visible: true,
    format: 'percent',
    position: 'start'
  };

 public removeComma(message: string): string {
    return message.replace(',', '');
  }
  public currentStep = 0;
  //hiding info box
  selection: boolean = true;
  routeselection: boolean = false;
  timetableselection: boolean = false;
  copying: boolean = false;
  taskCompleted: boolean = false;

  public running: number;

  public bvNumber = 1;
  public bvName = "TestBV";
  @Input() public formGroup;
  public data: { [Key: string]: string } = {
    options: 'all',
    description: '',
  };

  constructor(private notificatiosnervice: NotificationPanelService) {
    this.formGroup = new FormGroup({
      description: new FormControl('', [Validators.required]),
      options: new FormControl(this.data?.['options'])
    });

  }

  public steps = [
    { label: 'Options', disabled: false },
    //{ label: 'Route Selection', visibledsds :false },
    { label: 'Copying', disabled: true },
    { label: 'Summary', disabled: true },
  ];


  public onStepActivate(ev: StepperActivateEvent): void {
    if (!this.formGroup.valid) {
      this.currentStep = 0;
      return;
    }
    if (ev.index === this.steps.length - 1) {
      ev.preventDefault();
      return;
    }
    this.timetableselection = false;
    this.copying = false;
    this.routeselection = false;
    this.selection = false;
    if (ev.step.label == "Options")
      this.selection = true;
    if (ev.index > 0 || ev.index == this.steps.length - 1) {
      this.steps[ev.index + 1].disabled = false;
      this.steps[ev.index - 1].disabled = true;
    }

    if (ev.step.label == "Route Selection") {
      // this.steps[ev.index+1].disabled = false;
      // this.steps[ev.index-1].disabled = true;

      this.routeselection = true;
    }
    if (ev.step.label == "Copying") {
      this.AddItem();
      this.copying = true;
      this.startProgress();
      ev.step[1].disabled = true;
    }

    console.log(`Step ${ev.index} was activated`);
  }

  EnableControl(evt, text) {
    var target = evt.target;
    if (this.steps.findIndex(item => item.label === 'Date Selection') > 0)
      this.steps.splice(this.steps.findIndex(item => item.label === 'Date Selection'), 1);
    if (this.steps.findIndex(item => item.label === 'Route Selection') > 0)
      this.steps.splice(this.steps.findIndex(item => item.label === 'Route Selection'), 1);

    if (target.checked && text == 'masterRouteTimetable') {
      this.steps.splice(1, 0, { label: 'Date Selection', disabled: false });

      this.steps = [...this.steps];
    }
    if (target.checked && (text == 'masterRoute' || text == 'masterRouteTime' || text == 'masterRouteTimetable')) {
      this.steps.splice(1, 0, { label: 'Route Selection', disabled: false });
      // if(ev.index >0 ||  ev.index == this.steps.length-1)
      // {
      //   this.steps[ev.index+1].disabled = false;
      //   this.steps[ev.index-1].disabled = true;
      // }

      this.steps = [...this.steps];
    }

  }


  PrevStep() {
    if (this.currentStep > 0)
      this.currentStep = this.currentStep - 1;
  }

  NextStep() {

    if (this.currentStep === this.steps.length - 1) {
      return;
    }
    if (this.formGroup.valid) {
      this.timetableselection = false;
      this.copying = false;
      this.routeselection = false;
      this.selection = false;
      this.currentStep += 1;
      this.steps[this.currentStep + 1].disabled = false;
      this.steps[this.currentStep - 1].disabled = true;
      if (this.steps[this.currentStep].label == "Copying") {
        this.copying = true;
        this.startProgress();
      }
      return;
    }
    alert("Enter the BV description");

  }

  onTextBoxBlur() {
    if (this.formGroup.controls.description.pristine) {
      // Perform your action here when the pristine TextBox loses focus
      console.log("Pristine TextBox lost focus!");
    }
    else
      this.steps[this.currentStep + 1].disabled = false;
  }

  public startProgress(): void {
    this.running = setInterval(() => {
      if (this.value <= 100) {
        this.value++;
      } else {
        this.taskCompleted = true;
        this.currentStep += 1;
        this.stopProgress();
      }
    }, 50);
  }
  public stopProgress(): void {
    if (this.running) {
      clearInterval(this.running);
      this.running = null;
    }
  }

 public AddItem(): void
  {
    const newItem: Notifications = {
      id: 2,
      text : "Copy Base Version",
      datetime : new Date().getTime(),
      type: NotificationType.Warning
    };
    this.notificatiosnervice.addItem(newItem);
  }

}
