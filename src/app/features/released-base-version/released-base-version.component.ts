import { Component, Input, OnInit } from '@angular/core';
import { ListItemModel } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'released-base-version',
  templateUrl: './released-base-version.component.html',
  styleUrls: ['./released-base-version.component.css']
})
export class ReleasedBaseVersionComponent implements OnInit {

  @Input() releaseBaseVersions: any;
  public releasedVersionDropDownItems: ListItemModel[] = [
    {
      text: 'Download Consumer Files',
    },
    {
      text: 'Create Delta Files',
    },
  ];
  constructor() { }

  ngOnInit() {
  }

  getQualityClass(quality: string): string {
    switch (quality) {
      case 'Ok':
        return 'green';
      case 'NotOk':
        return 'red';
      default:
        return 'grey'; // Default class or an empty string if no class is needed
    }
  }

  getStateClass(state: string): string {
    switch (state) {
      case 'Available':
        return 'green';
      case 'Editing':
        return 'orange';
      case 'Blocked':
        return 'red';
      default:
        return 'grey'; // Default class or an empty string if no class is needed
    }
  }


}
