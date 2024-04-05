import { AfterViewInit, Component, Input, OnInit, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { GridComponent, GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";

import { DetailsService } from './nestedservice';
import { isDocumentAvailable } from "@progress/kendo-angular-common";


@Component({
  providers: [DetailsService],
  selector: 'nested-app',
  templateUrl: './nestedgrid.component.html',
})
export class NestedGridComponent implements OnInit, AfterViewInit {
  public view: Observable<any[]>;
  public isLoading: boolean;

  // For Angular 8
  // @ViewChild(GridComponent, { static: false })
  // public grid: GridComponent;

  @ViewChild(GridComponent) grid: GridComponent;

  constructor(private service: DetailsService) {
    alert("SUCESS");
  }

  public ngOnInit(): void {
    // Bind directly to the service as it is a Subject
    this.view = this.service;
    this.isLoading = this.service.loading;

    // Fetch the data with the initial state
    this.loadData();
  }

  public ngAfterViewInit(): void {
    if (!isDocumentAvailable()) {
        return;
    }

    // Expand the first row initially
    this.grid.expandRow(0);
  }

  private loadData(): void {
    this.service.query('stops','stoppingpoints',{
      skip: 0,
      take: 8
    });
  }
}
