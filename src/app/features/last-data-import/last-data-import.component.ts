import { Component, Input, OnInit } from '@angular/core';
import { ListItemModel } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'last-data-import',
  templateUrl: './last-data-import.component.html',
  styleUrls: ['./last-data-import.component.css']
})
export class LastDataImportComponent implements OnInit {

  @Input() lastImportedBaseVersions: any;
  public lastDataImportDropDownItems: ListItemModel[] = [
    {
      text: 'Export Base Version',
    },
    {
      text: 'Delete',
    },
  ];
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

  constructor() { }

  ngOnInit() {
  }

}
