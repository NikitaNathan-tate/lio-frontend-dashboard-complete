import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreadCrumbItem } from '@progress/kendo-angular-navigation';
import {
  bookIcon,
  eyeIcon,
  fileAddIcon,
  paperclipIcon,
  userIcon,
} from "@progress/kendo-svg-icons";

@Component({
  selector: 'app-copy-base-version',
  templateUrl: './copy-base-version.component.html',
  styleUrls: ['./copy-base-version.component.css']
})
export class CopyBaseVersionComponent implements OnInit {
onCloseCreateNewBaseVersion() {
  this.router.navigate(['/dashboard']);
}

  items: any[] = [
    {
      iconName: 'home', // Use the name of the Material icon here
    },
    {
      text: 'Item 2',
    },
    {
      text: 'Item 3',
    },
    {
      text: 'Item 4',
    },
  ];

  public current = 1;

  public steps = [
    { label: "Personal Info", svgIcon: userIcon },
    { label: "Education", svgIcon: bookIcon },
    { label: "Attachments", svgIcon: paperclipIcon, optional: true },
    { label: "Preview", svgIcon: eyeIcon },
    { label: "Submit", svgIcon: fileAddIcon },
  ];

  public value = 0;
  public running: any;
  

  constructor( public router: Router,) { }

  ngOnInit() {
    this.startProgress();
  }


  public startProgress(): void {
    this.running = setInterval(() => {
      if (this.value <= 100) {
        this.value++;
      } else {
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

  public onItemClick(item: BreadCrumbItem): void {
    const index = this.items.findIndex((e) => e.text === item.text);
    this.items = this.items.slice(0, index + 1);
  }
}
