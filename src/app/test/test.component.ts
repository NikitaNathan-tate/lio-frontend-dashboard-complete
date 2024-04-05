import { Component, ViewChild, OnInit, AfterViewInit } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";

import { AddEvent, CancelEvent, CellClickEvent, FilterableSettings, GridComponent, GridDataResult, GridSize, MultipleSortSettings, RemoveEvent, SaveEvent } from "@progress/kendo-angular-grid";
import { DetailsService, MasterService } from "../features/nestedgrid/nestedservice";

import { isDocumentAvailable } from '@progress/kendo-angular-common';
import { map } from "rxjs/operators";
import { CompositeFilterDescriptor, GroupDescriptor, SortDescriptor, orderBy, groupBy, filterBy, State } from '@progress/kendo-data-query';
import { HttpClient } from "@angular/common/http";
import { DetailComponent } from "../features/nestedgrid/childgrid/child.component";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
  providers: [MasterService,DetailsService],
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {

  public smallSize: GridSize = 'small';
  public  view$: Observable<any[]>;
  public sort: SortDescriptor[] = [];
  public isLoading: boolean;
  dropdownData: any[]; // The items for the dropdown
  selectedValue: any = { id: '*' }
  public sortSettings: MultipleSortSettings = {
    mode: 'multiple',
    //multiSortKey: this.modifierKey
  };
  public filter: CompositeFilterDescriptor={
    logic: 'or',
    filters: []
  };
public filterable: FilterableSettings='menu, row';
public gridState: State = {
  sort: [],
  skip: 0,
  take: 1000,
};
  // For Angular 8
  // @ViewChild(GridComponent, { static: false })
  // public grid: GridComponent;

  @ViewChild(GridComponent) grid: GridComponent;
  editDataItem: any;

  constructor(private service: MasterService,private detailsService: DetailsService,
    private formBuilder: FormBuilder,private http:HttpClient) {}

  public ngOnInit(): void {
     this.fetchDataFromAPI();

    // Bind directly to the service as it is a Subject
    this.view$ = this.service;
    this.isLoading = this.service.loading;

    // Fetch the data with the initial state
    this.loadData();
  }
  fetchDataFromAPI() {
    const apiUrl = 'http://localhost:8041/stops';
    
    // Initialize the dropdownData with the asterisk (*) value
    this.dropdownData = [{ id: '*', name: '*' }];
  
    this.http.get(apiUrl).subscribe(
      (response: any) => {
        // Assuming the API returns an array of objects with 'id' and 'name' properties
        const apiData = response.map((item: any) => ({
          id: item.primarykeyduid,
          name: item.shortcode
        }));
  
        // Concatenate the asterisk (*) value with the fetched data
        this.dropdownData = this.dropdownData.concat(apiData);
      },
      (error) => {
        console.error('Error fetching data from API:', error);
      }
    );
  }
  
  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;

    this.view$.pipe(
      map((data: any[]) => {
        data = orderBy(filterBy(data,this.filter), this.sort);
        return data;
      })
    ).subscribe((sortedData: any[]) => {
      this.view$ = of(sortedData);
    });
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
   // this.view$ = orderBy(this.service.get,sort);
   this.view$.pipe(
    map((data: any[]) => {
      data = orderBy(data, this.sort);
      return data;
    })
  ).subscribe((sortedData: any[]) => {
    this.view$ = of(sortedData);
  });
  }
  public ngAfterViewInit(): void {
    if (!isDocumentAvailable()) {
        return;
    }

    // Expand the first row initially
    this.grid.expandRow(0);
  }
  @ViewChild(DetailComponent) childComponent!: DetailComponent; // Get a reference to the child component

  onDropdownSelectionChange(event: any) {
    // Handle dropdown selection change event
    const selectedOption:any = event.id;
    this.view$=this.service;
    if (selectedOption !== '*') 
    {
      this.view$ = this.view$.pipe(
      map((data) => ({
        ...data,
        data: data.filter((item: { primarykeyduid: number; }) => item.primarykeyduid === selectedOption),
      }))
    );
    //this.childComponent.update(selectedOption);
    } 
  }
  private loadData(): void {
    this.service.query('stops','stoppingpoints',{
      skip: 0,
      take: 8
    },1);
  }

  public editHandler(args: AddEvent): void {
    this.editDataItem = args.dataItem;
 }

 public addHandler(args: AddEvent): void {
  this.service.isNewRow = true;
   //args.sender.addRow(this.createFormGroup(this.generalTemplateHelper.GetInstance(this.pageName)));
}

public cancelHandler(args: CancelEvent): void {
  this.service.isNewRow = false;

  args.sender.closeRow(args.rowIndex);
}

public saveHandler(args: SaveEvent): void {
    // if (args.formGroup.valid) {
    //     this.service.create(args.formGroup.value);
    //     args.sender.closeRow(args.rowIndex);
    //     this.view$ = this.service.pipe(
    //       map((data) => {
    //         const transformedData = data.map(item => {
    //           return Object.assign({}, item, {
    //             isPlaying: new BehaviorSubject<boolean>(false),
    //           });
    //         });
    //         return process(transformedData, this.gridState);
    //       })
    //     );
    //     //this.GetGridItem();
    // }
}

public removeHandler(args: RemoveEvent): void {
    this.service.remove(args.dataItem);

    args.sender.cancelCell();
}
public cellClickHandler({ sender, rowIndex, columnIndex, dataItem, isEdited }) {
  if (!isEdited) {
    console.log(sender);
      sender.editCell(rowIndex, columnIndex, this.createFormGroup(dataItem));
  }
}

public cellCloseHandler(args: any) {
  const { formGroup, dataItem } = args;

  if (!formGroup.valid) {
       // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
  } else if (formGroup.dirty) {
      console.log("save data")
  }
}

public createFormGroup(dataItem: any): FormGroup {
  return this.formBuilder.group({
      'stopnumber': dataItem.stopNumber,
      'longdescription': dataItem.longdescription,
      'Description': dataItem.shortcode,
  });
}

}


