import { Component,ChangeDetectorRef, Input, Renderer2, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CellSelectionItem, ColumnBase, ColumnComponent, MultipleSortSettings, ColumnMenuSettings, PageChangeEvent, GridSize,ScrollMode, GroupRowArgs,
 FilterableSettings, RowArgs, DetailExpandEvent, DetailCollapseEvent, CreateFormGroupArgs,DataBindingDirective, GridClipboardEvent, NumericFilterCellComponent, DataStateChangeEvent} from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, GroupDescriptor, SortDescriptor, orderBy, groupBy, filterBy } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, fromEvent, merge, of, timer } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeneralTemplateService } from '../services/general-template.service';
import { Validators, FormBuilder, FormGroup,FormControl } from '@angular/forms';
import { GridSettings } from '../services/grid-settings.interface';
import { ColumnSettings } from '../services/column-settings.interface';
import { StorageService } from 'src/app/storage/storageservice';
import { AudioService } from '../../../shared/audio/services/audio.service';
import { CloudService } from '../../../shared/audio/services/cloud.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { SVGIcon, filePdfIcon } from '@progress/kendo-svg-icons';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import GeneralTemplateHelper from './generaltemplatehelper';
import {
  AddEvent,
  GridDataResult,
  CellClickEvent,
  CellCloseEvent,
  SelectionEvent, SelectableMode, SelectableSettings,
  SaveEvent,
  CancelEvent,
  GridComponent,
  RemoveEvent
} from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';

import { Keys } from '@progress/kendo-angular-common';
import { AttributeInfo, FetchData, GuiTable, Links, PrimaryKeyValues, RootObject, UpdateAttribute, UpdateTable } from '../model/model';

import { EditService } from '../services/edit.service';

import { debounce, map, take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ExcelExportData  } from '@progress/kendo-angular-excel-export';
import {
  aggregateBy,
  AggregateDescriptor,
  AggregateResult
} from "@progress/kendo-data-query";
import { GridContextMenuComponent } from 'src/app/shared/contextmenu/grid-context-menu/grid-context-menu.component';
import { SafeStyle,DomSanitizer } from '@angular/platform-browser';
import { GridFunction } from './gridfunctions';
import { SharedService } from 'src/app/shared/shared.service';
import { DetailComponent } from '../../nestedgrid/childgrid/child.component';
import { MenubarComponent } from 'src/app/shared/menubar';
import { AppConfig } from 'src/app/AppConfig.service';
import { DataService } from 'src/app/data.service';
import { UserNotificationService } from 'src/app/shared/usernotification/usernotification.service';

import { formatDate } from '@angular/common';
import { IMapQueryParams } from 'src/app/map/interfaces/map-query-params.interface';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  providers: [EditService],
  selector: 'app-general-template',
  templateUrl: './general-template.component.html',
  styleUrls: ['./general-template.component.scss','./pdf-styles.scss', './page-template.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GeneralTemplateComponent {

  @Input() data: any[];
  @Input() columns: any[];
  @Input() public pageName: string;
  @Input() parameterName: string;
  @Input() secondParameterName: string;

  @Input() isDropdownVisible: boolean = false;
  @Input() isSecondDropdownVisible: boolean = false;

  @Input() globalData: any[];
  @Input() childpageName: string;
  @Input() tableName: string;
  @Input() childTableName: string;
  @Input() bvNumber:number;
  @Input() public tableType:string;
  @Input()  public columnFilterValues: { [key: string]: any[] } = {};
  @Input() public keysArray: string[];
  @Input() public mapdisplay: boolean=false;

  dropdownData: any[]; // The items for the dropdown
  secondDropdownData: any[]; // The items for the dropdown
  selectedItem: string;  // The selected item in the dropdown
  private selectedCellData = [];
  private prevSelectedCellData = [];
  private firstSelectedCellData : string;

  @Input() public windowParameters: any;

  public gridSettings: GridSettings;
  public savedGridSettings: GridSettings;
  private unsubscribe$: Subject<void> = new Subject<void>();
  public editDataItem: Links;
  public selectableSettings: SelectableSettings;
  public mode: SelectableMode = 'multiple';
  public drag = true;
  public disableGridSelection: boolean = false;
  public clipboardContent: string;
  
  isAudioPaused: boolean = false;  
  currentFile: any = {};
  isPlayingMap: Map<any, boolean> = new Map<any, boolean>();
  @ViewChild(GridComponent) private grid: GridComponent;
  @ViewChild(DetailComponent) childComponent!: DetailComponent; // Get a reference to the child component
  public smallSize: GridSize = 'small';
  public groupable : boolean = false;
  public showFilterRow : boolean = true;
  public isFirstColumn : boolean = false;
  public selectedColumnIndex: number;
  public selectedRowIndex: number;
  public rowData: any ;
  public fileName : string;
  public scrollable: ScrollMode = 'scrollable';
  public shouldExpandAll: boolean = true;
 private gridFunction : GridFunction;
 public filterable: FilterableSettings='menu, row';
 public height = window.innerHeight * 0.8;
 
 @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public filePdfIcon: SVGIcon = filePdfIcon;
  public masterDropdowValue: { id: number, name: string } 
  public secondmasterDropdownValue: { id: number, name: string } = { id: -1, name: '*'};

  public masterDropdowValue1: {  Text: string } ;
  public visibleColumns: any ;

    clipBoardCopiedColumns: string[]  =[] 
   // this resetload is used by the child grid , when we call the child grid the first time then the loading image is shown and for 
   //subsequnet rows thhi is not needed
  private resetload = false;
  public isChildTableLoaded: boolean = false;
  public initiallyExpanded = false;
  public cellArgs: CellClickEvent;
  public isGroupExpanded = (rowArgs: GroupRowArgs): boolean => {
    return this.shouldExpandAll;
  };
  
  formatDate(item:any,itemtype:any)
  {
    if(itemtype!=="date")
      return item;
    return formatDate(item,this.userDateFormat,'en');
  }
  constructor(private router: Router, private http: HttpClient, private generalTemplateService: GeneralTemplateService,
    public editService: EditService, private formBuilder: FormBuilder
    , public storageService: StorageService,public cdr: ChangeDetectorRef,
    public audioService: AudioService,private renderer: Renderer2,private dataservice:DataService,
    public cloudService: CloudService, private clipboard: Clipboard,private sanitizer: DomSanitizer,private userNotificationService: UserNotificationService
    
  ) {
    this.gridFunction= new GridFunction(this);
    this.setSelectableSettings();
    this.audioService.getState().pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
      this.updatePlaybackState(state);
    });
    this.gridFunction.BuildContextMenuItems();
    this.createNewFormGroup =  this.createNewFormGroup.bind(this);
    
  }

  public createNewFormGroup(args: CreateFormGroupArgs): FormGroup {
      
    var controlGrp = this.formBuilder.group({});
    let dataItem : any;
    dataItem = null;
    if(args != null && args.sender  != undefined)
    dataItem = args.sender.activeRow;
  if(args.dataItem != null)
  dataItem = args.dataItem;

    let dataPoints: any ;
    dataPoints = this.data;
    let  columns:any[];
   let parentIndex : number;
   columns =this.columns;
    const minDataItem = dataPoints.reduce((prev, current) => (prev.primarykeyduid < current.primarykeyduid) ? prev : current);
    var minPrimarykeyduid:number = -1;
    if(minDataItem!=undefined && minDataItem!=null)
    { 
      minPrimarykeyduid = minDataItem.primarykeyduid as number;
    }
    if(minPrimarykeyduid>0)
    {
      minPrimarykeyduid=0;
    }
    const formGroupConfig: { [key: string]: any } = {};
    for (const prop in dataItem) {
      if (dataItem.hasOwnProperty(prop)) {
        formGroupConfig[prop] = [dataItem[prop]]; // Use the current property value as the initial value
      }
    }
    
    // Create the form group dynamically
    controlGrp = this.formBuilder.group(formGroupConfig);
      return controlGrp;
  }

  rowHeight: number = 40; // Adjust the row height according to your styling
  gridHeight: number = 600; // Adjust the grid height according to your styling
  totalRecords: number = 100; // Initialize with the actual total number of records

  get calculatedPageSize(): number {
    const maxPageSize = Math.floor(this.gridHeight / this.rowHeight);
    return Math.min(maxPageSize, this.totalRecords);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
     document.removeEventListener('contextmenu', this.preventContextMenu, false);
  }
  ngAfterViewInit() {
    window.addEventListener("resize", () => {
      this.height = window.innerHeight * 0.8;
    });
}
  updatePlaybackState(state: any) {
    const stoppedItems = Array.from(this.isPlayingMap.keys()).filter(item => item !== state.item);

    // Set isPlaying to false for all stopped items
    stoppedItems.forEach(item => {
      this.isPlayingMap.set(item, false);
    });
  }

  public onClipboard(e: GridClipboardEvent, directive: DataBindingDirective): void {
    console.log(e);
    this.clipboardContent = e.clipboardData;
    const columnKeys = this.kendoSelection.map(item => item.columnKey);
          const uniqueColumnKeys = new Set(columnKeys);
          const distinctColumnKeys = Array.from(uniqueColumnKeys);
    switch (e.type) {
        case 'paste':
            this.data.splice(e.target.dataRowIndex, e.gridData.length, ...this.mapItems(e));
            directive.notifyDataChange();
            console.log('copy',   e);
            this.grid.closeCell()
            console.log('copy',   this.data);
            break;
        case 'cut':
            this.data.splice(
                e.target.dataRowIndex,
                e.gridData.length,
                ...e.gridData.map((item) => item.dataItem)
            );
            console.log(this.data);
            directive.notifyDataChange();
            break;
        case 'copy':
            console.log('copy', e);
            // for(var idx in distinctColumnKeys)
            // {
            //  this.clipBoardCopiedColumns.push(this.visibleColumns[idx].field)
            // }
            break;
    }
}  private mapItems(e: GridClipboardEvent): any[] {
    let rowIndex : number =e.target.dataRowIndex +1 ;
    let primarykey: number = -1;
  return e.gridData.map((item) => {
    let combinedData = {
        ...e.target.dataItem,   // Spread operator to include properties from the original data item
        ...item.dataItem,       // Spread operator to include properties from the current item in gridData
    };
    if(rowIndex  > this.data.length)
    {
      combinedData.primarykeyduid = primarykey;
      primarykey = primarykey -1;
      for(var colField of this.columns)
      {
        if (!this.clipBoardCopiedColumns.includes(colField.field))  
        {
          combinedData[colField.field] = ''
        }
      }
    }
    rowIndex = rowIndex + 1;

    console.log('Combined Data:', combinedData); // Log the combined data
    this.UpdateEditItemPushUpdateTable(combinedData.primarykeyduid,e.target.colField,combinedData,combinedData[e.target.colField])

    return combinedData; // Return the combined data
});
}
  public readonly doNotCommaSeparateNumberFormat = '################';
  public  pageSize = 1050;
  public filterData: any; // Filter configuration
  public sortDescriptor: SortDescriptor[] = [];
  public filter: CompositeFilterDescriptor={
    logic: 'or',
    filters: []
  };
  
  public loading : boolean = false;
  public generalTemplateHelper: GeneralTemplateHelper = new GeneralTemplateHelper(this.formBuilder);
  public sort: SortDescriptor[] = [];
  public gridContextMenuItems: any[] = [];
  public gridRowHeaderContextMenuItems: any[] = [];
  public getColumnHeaderContextMenuItems: any[] = [];
  public getTableHeaderContextMenuItems: any[] = [];
  public dropdownOptions: any[] = [
    { text: 'No activity', value: 0 },
    { text: 'auto.', value: 1 },
    { text: 'manual', value: 2 },
  ];
  public columnMenu: ColumnMenuSettings = {
    columnChooser: true,
    sort: true,
    autoSizeAllColumns: false,
    autoSizeColumn: false,
    lock: false,

  };
  public menuSettings: ColumnMenuSettings = {

    autoSizeAllColumns: true,
  };
  public sortSettings: MultipleSortSettings = {
    mode: 'multiple',
    //multiSortKey: this.modifierKey
  };
  private filteredArray :any[]; 
  public groups: GroupDescriptor[] = [];
  public expandedKeys: string[] = [];
  public setSelectableSettings(): void {
    this.selectableSettings = {
      cell: true,
      mode: this.mode,
      drag: this.drag
    };
  }
  public validationmessage : string;
// Use an arrow function to capture the 'this' execution context of the class.
public isRowSelected = (e: RowArgs) => this.selectedCellData.indexOf(e.dataItem) >= 0;
  public view: Observable<GridDataResult>;
  public gridState: State = {
    skip: 0,
    take: 40,
    sort: []
  };

  public changes = {};
  preventContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
  public className: "k-i-checkbox-checked"
  
  userDateFormat:string="dd/MM/yyyy";
   ngOnInit() {
    this.dataservice.bvNumber=this.bvNumber;
    this.editService.bvNumber=this.bvNumber;
    this.loading=true;

    this.ContainsChildTable().subscribe(result => {
      this.isChildTableLoaded = result;
    });
    
    if(this.windowParameters.length == 2)
    this.isSecondDropdownVisible = true;
    if(this.tableType  == undefined)
      this.tableType  = 'complex';
    if(this.tableType  != undefined && this.tableType == 'simple')
      this.groupable=true;
    else
     this.groupable=false;
    this.filteredArray =  this.columns.filter(reference=>reference.refTable !=null)
     .map(item => ({ refTable: item.refTable, field: item.field }));
    this.PopulateDropDowns();
 
    this.bindKeypressEvent().subscribe(($event: KeyboardEvent) => this.onKeyPress($event));
    // Populate dropdown data at runtime
    document.addEventListener('contextmenu', this.preventContextMenu, false);
    this.userDateFormat = "dd/MM/yyyy";
    this.storageService.getRequiredItem('DATEFORMAT', 'UserSetting').then((items) => {
      //  items = items.filter(i=>i.idx.contains(this.data))
       if(items.length > 0)
       {
        this.userDateFormat = items[0].columns;
       }
      });
 this.totalRecords = this.data.length;
      
    this.view = this.editService.pipe(
      map((data) => process(data, this.gridState))
    );
    this.editService.generalTemplateComponent = this;
    //this.childComponent.update(200);
    this.editService.read(this.data);
    
    if(this.ContainsChildTable())
    {
      this.editService.detailComponent=this.childComponent;
    }
    this.GetGridItem();
    this.gridFunction.BuildContextMenuItems();
    this.fileName = this.pageName + '.xlsx';
    this.validationmessage = "Invalid Column";
  }
  selectedValue: number | string = '*'; // Default selected value is set to -1 (which represents '*')

  private async PopulateDropDowns() {
    //this code populated  the page dropdown
  let  counter : number = 1;
    let windowParameters = this.windowParameters;
    for (let windowParameter of windowParameters) {
      let tableName = windowParameter.Table;
  
      if (this != undefined && this.isDropdownVisible == true) {
        await this.populateDropdown(tableName, counter,windowParameter.Name,windowParameter.Title);
        counter++
      }
    }
    const columnsWithSetItems = this.columns.filter(column => column.SetItems);
    columnsWithSetItems.forEach(column => {
      this.columns.forEach(column => {
        if (column.SetItems.length > 0) {
          this.columnFilterValues[column.field] = column.SetItems;
        }
      });
    });
    console.log(this.columnFilterValues);
    let filteredArray = this.columns.filter(reference => reference.refTable != null);
    for (const element of filteredArray) {
      try {
        this.storageService.getRequiredItem(this.bvNumber+'_'+ element.refTable.toLowerCase(), 'Representation').then((items) => {
          if (items.length > 0) {
            var itemData = items[0];
            {
            const mappedData: { Value: number, Text: string }[] = [];
            var itemColumns = itemData.columns;
            for (let key in itemColumns) {
              if (itemColumns.hasOwnProperty(key)) {
                mappedData.push({ Value: +key, Text: itemColumns[key] });
              }
            }            
              if (this.columnFilterValues[element.field]) {
                this.columnFilterValues[element.field] = this.columnFilterValues[element.field].concat(mappedData);
              } else {
                this.columnFilterValues[element.field] = mappedData;
              }
            this.keysArray = Object.keys(this.columnFilterValues);

            }
          }
        });
      }
      catch (error) {
        console.error(error);
      }
    }
  }
  private  populateDropdown(tableName: string, counter: number, columnName : string,title : string) {
    this.storageService.getRequiredItem(this.bvNumber+'_'+ tableName.toLowerCase(), 'Representation').then(
      repoData => {
     if (repoData.length > 0) {
        let repitems = repoData[0];
        {
          const mappedData: { id: number, name: string }[] = [];
          var colItems = repitems.columns;
          mappedData.push({ id: -1, name: '*'});
          for (let key in colItems) {
            if (colItems.hasOwnProperty(key)) {
              mappedData.push({ id: +key, name: colItems[key] });
            }
          }        
          
          if (counter == 1) {
            this.dropdownData = mappedData;
            if (mappedData.length > 0) {
              if(this.windowParameters.length>1)
              {
                this.masterDropdowValue = mappedData[0];
                if(mappedData[0].id==-1)
                  this.data = this.globalData;
                else
                  this.data = this.globalData.filter(d => d[columnName] === mappedData[0].id);
              }
              else
              {
                this.masterDropdowValue = mappedData[0];
              }
              this.parameterName = title;
            }
            
            this.editService.read(this.data);
          } else {
            this.secondDropdownData = mappedData;
            this.secondParameterName = title
          }
          counter++;
        }
        this.loading=false;
      }
      },
    error => {
      //this.logger.warning(() => 'Got error in promise >> ' + error);
    });
   
  }
onKeyPress($event: KeyboardEvent) {
    if(($event.ctrlKey || $event.metaKey) && $event.keyCode == 67)
    {
      if(this.selectedColumnIndex===0)
        this.CopyRows();
      else
      {
        this.clipboard.copy(this.selectedCellData.join(' '));
        this.prevSelectedCellData = this.selectedCellData;
      }
    }
    // if(($event.ctrlKey || $event.metaKey) && $event.keyCode == 86)
    //   this.PasteFromClipboard(this.prevSelectedCellData);

}

private bindKeypressEvent(): Observable<KeyboardEvent> {
    const eventsType$ = [
        fromEvent(window, 'keypress'),
        fromEvent(window, 'keydown')
    ];
    // we merge all kind of event as one observable.
    return merge(...eventsType$)
        .pipe(
            // We prevent multiple next by wait 10ms before to next value.
            debounce(() => timer(10)),
            // We map answer to KeyboardEvent, typescript strong typing...
            map(state => (state as KeyboardEvent))
        );
}
  public GetGridItem()
  {
    this.storageService.getRequiredItem(this.pageName,'TableSetting').then((items) => {
 if(items.length >0)
 {
      if (items[0]!= null && items[0] !=undefined) {
        if(items[0].state.sort != undefined)
        {
          this.gridSettings.state.sort = JSON.parse(JSON.stringify(items[0].state.sort)) ;
        }
        if(items[0].state.group != undefined)
        {
          this.gridSettings.state.group = JSON.parse(JSON.stringify(items[0].state.group)) ;
          this.groups   = this.gridSettings.state.group
        }
        if(items[0].columnsConfig != undefined)
        {
          this.gridSettings.columnsConfig = JSON.parse(JSON.stringify(items[0].columnsConfig)) ;
          this.columns= this.gridSettings.columnsConfig ;
        }
        this.savedGridSettings = JSON.parse(JSON.stringify(this.gridSettings));
          
      }
    }
    });
  }
  public selectedCells: any[] = [];
 
  isCellSelected(cellData: any): boolean {
    return this.selectedCells.some((cell) => cell.id === cellData.id);
  }
  public onChange(state: DataStateChangeEvent): void {
    this.gridState = state;
    this.editService.read(this.data);
}

  onFilter(value: string) {
    this.filterData = {
      logic: 'or',
      filters: this.columns
        .filter((column) => column.filterable)
        .map((column) => ({
          field: column.field,
          operator: 'contains',
          value: value,
        })),
    };
  }
  public pageChange(event: PageChangeEvent): void {
  this.loading= true;;

    //this.gridState.skip = event.skip;
  this.loading= false;;

  }
  private compareForSort(a: any, b: any, direction: 'asc' | 'desc' = 'asc'): number {
    // Compare function based on the sorting direction
    const compareResult = direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
  
    return compareResult;
  }
  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.gridSettings.state.filter = filter;
    this.gridState =  this.gridSettings.state;
    
  }
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.gridSettings.state.sort = sort;
    this.gridState =  this.gridSettings.state;
    
  }
sortDropDown(sort: SortDescriptor[])
{
    const keysArray: string[] = Object.keys(this.columnFilterValues);
    var filterType ="text";
    
    sort.forEach((sort: SortDescriptor) => { 
      var columnComponent =
      this.columns.filter((column)=>column.field.toLowerCase().includes(sort.field.toLowerCase()))[0] as ColumnComponent
      if(columnComponent!=undefined)
        filterType = columnComponent.filter;
      if (keysArray.some(item => item === sort.field) && sort.dir === 'asc' && filterType==='text') {
      sort.compare = (a, b) => {
        var fetchedValueA = this.GetDropDownValue(sort.field, a)+'';
        var fetchedValueB = this.GetDropDownValue(sort.field, b)+'';
        return fetchedValueA.localeCompare(fetchedValueB)
        ;
      };
    }
    else if (keysArray.some(item => item === sort.field) && sort.dir === 'desc' && filterType==='text') {
      sort.compare = (a, b) => {
        var fetchedValueA = this.GetDropDownValue(sort.field, a)+'';
        var fetchedValueB = this.GetDropDownValue(sort.field, b)+'';
        return fetchedValueB.localeCompare(
          fetchedValueA);
      };
    } 
  });
}
  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.gridSettings.state.group = groups;
    this.gridState =  this.gridSettings.state;
    this.expandedKeys = [];
    this.saveGridSettings();   
    this.gridFunction.BuildContextMenuItems();
  }
  public groupKey = (groupRow: GroupRowArgs): string => {
    if (!groupRow) {
      return null;
    }

    // Checks if there's a parent key and prepends it.
    return [this.groupKey(groupRow.parentGroup), groupRow.group.value]
      .filter((id) => id !== null)
      .join("#");
  };
  public onGroupExpand(event: any,groupType : string): void {
    // Update the isGroupExpanded property to reflect the changes
    if(groupType == 'groupCollapse')
      this.shouldExpandAll = false;
      if(groupType == 'groupExpand')
      this.shouldExpandAll = true ;
  }
  
  onDropdownSelectionChange(event: any) {
    this.loading=true;
      this.data =  this.data = [...this.globalData]; ;
      let paramName = this.windowParameters[0].Name
      if(!(event.id === -1))
        this.data = this.globalData.filter(d=>d[paramName]=== event.id);
      
    if(this.windowParameters.length > 1)
    {
      var secondArray = this.data.map(item => item[this.windowParameters[1].Name]);
      this.storageService.getRequiredItem( this.bvNumber+'_'+ this.windowParameters[1].Table.toLowerCase(), 'Representation').then((items) => {
        if(items.length>0)
        {
          let repitems = items[0];
          var colItems = repitems.columns;  
          const filteredData: { idx: number, representation: string }[] = [];      
          for (let key in colItems) {
            if (secondArray.includes(+key)) {
              filteredData.push({ idx: +key, representation: colItems[key] });
            }
          }    
          const mappedData = filteredData.map(item => ({
            id: item.idx,
            name: item.representation,
          }));
          mappedData.unshift({ id: -1, name: '*' });    
          this.secondmasterDropdownValue = mappedData[0]
          this.secondDropdownData = mappedData
        }
      });
     
      // var url : string = AppConfig.settings.apiUrl+'/'+this.childpageName.toLowerCase()+'/'+this.bvNumber
      // if(this.childpageName == 'patternsequences')
      // {
      //     localStorage.removeItem(this.childpageName.toLowerCase());
      //     var routeIndex: number
      //     routeIndex = event.id
      //      url = AppConfig.settings.apiUrl+'/'+this.childpageName.toLowerCase() + AppConfig.settings.templateExtension;
      //      if(AppConfig.settings.templateExtension=='')
      //       url = url+'/'+this.bvNumber+'/'+routeIndex
      //      this.dataservice.fetchDataFromApi(this.childpageName.toLowerCase(), url,true).then(async (data) => {
      //   })        
      // }
    }
    this.editService.read(this.data);
    if(this.ContainChildTable())
    {
      this.data
        .forEach((item, idx) => {
          this.grid.collapseRow(idx);
        })
    }
    this.loading=false;
  }
  
  onSecondDropdownSelectionChange(event: any) {
    this.data =  this.data = [...this.globalData]; ;
    let paramName = this.windowParameters[1].Name
    if(!(event.id === -1))
    this.data = this.data.filter(d=>d[paramName]=== event.id);
}
  public cellClickHandler(args: CellClickEvent): void {
    this.cellArgs = args;
    // this.currentEditColumn = this.isEditing ? columnField : null;
    this.isFirstColumn = false;
    this.selectedColumnIndex = args.columnIndex;
    this.selectedRowIndex = args.rowIndex;
        
    let columnType=
    this.columns.filter((column)=>column.title.toLowerCase().includes(args.column.title.toLowerCase()))[0]['type'];
    var columnComponent =
    this.columns.filter((column)=>column.title.toLowerCase().includes(args.column.title.toLowerCase()))[0] as ColumnComponent
    if(columnType == 'list')
    {
      return;
    }
    if(columnType == 'dropdown')
    {
      const filterValues =  this.columnFilterValues[columnComponent.field];
      const selectedRow =  this.data.filter(i=>i.primarykeyduid == args.dataItem['primarykeyduid'])[0]
      if (filterValues && filterValues.length > 0) {
       this.masterDropdowValue1 =args.dataItem[columnComponent.field]// filterValues.find(item => item.Value === args.dataItem[columnComponent.field]).Text;
    }
   }
    if(columnType == 'number')
    {
       this.gridContextMenuItems = [
      { label: "What's this", disabled: false },
      { label: "Cut", disabled: false },
      { label: "Copy", disabled: false },
      { label: "Paste", disabled: false },
      { label: "Auto Complete(copy first cell)",  disabled: false },
      { label: "Auto Complete(data series)", disabled: false },
      { label: "Free Number Search", disabled: false },
      { label:  "Call Up Record", disabled: false },
    ];
  }
  else
  this.gridContextMenuItems = [
    { label: "What's this", disabled: false },
    { label: "Cut", disabled: false },
    { label: "Copy", disabled: false },
    { label: "Paste", disabled: false },
    { label: "Auto Complete(copy first cell)",  disabled: false },
    { label: "Auto Complete(data series)", disabled: true },
    { label: "Free Number Search", disabled: false },
    { label:  "Call Up Record", disabled: false },

  ];
    
    if(args.columnIndex == 0)
    {
      this.isFirstColumn = true;
      this.rowData =  args.dataItem ;
    }
    this.isAudioPaused = false;
  }
  public onDblClick(): void {
    this.isEditing = !this.isEditing;
    
    this.toggleEditMode();
   
    if (this.cellArgs!=undefined && !this.cellArgs.isEdited) {
      this.cellArgs.sender.editCell(this.cellArgs.rowIndex, this.cellArgs.columnIndex, this.generalTemplateHelper.createFormGroup(this.cellArgs.dataItem,this.columns));

    }
  }
  public kendoSelection: CellSelectionItem[] = [];
  public selectionChangeHandler(args: SelectionEvent): void {
    this.selectedCellData = [];
    const gridData = this.grid.data as GridDataResult ;
    const dataArray = gridData;
    this.visibleColumns =  this.columns.filter(h=>h.hidden == false)
    let previousRowIndex = -1;
    let isFirtCell : boolean = true;
    this.kendoSelection = this.kendoSelection.sort(this.generalTemplateHelper.CompareItems);
    for (const row of this.kendoSelection) {
      if(row.itemKey < 0)
      continue;
      const columnComponent = this.grid.columns.toArray()[row.columnKey] as ColumnComponent;
      const field = this.visibleColumns[row.columnKey-1];// columnComponent.field;
 
      if (previousRowIndex !== -1) {
        if (previousRowIndex !== row.itemKey && previousRowIndex !== -1) {
          this.selectedCellData.push('\n');
        }
        else
          this.selectedCellData.push('\t');
      }
      if(isFirtCell)
      {
        isFirtCell = false;
        this.firstSelectedCellData = dataArray.data[row.itemKey][field.field]
      }
      this.selectedCellData.push(dataArray.data[row.itemKey][field.field]);
      previousRowIndex = row.itemKey;
    }
  }

  public cellCloseHandler(args: CellCloseEvent): void {
    const { formGroup, dataItem } = args;

    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      if (args.originalEvent && args.originalEvent.keyCode === Keys.Escape) {
        return;
      }
      if (!this.editService.editedItems[formGroup.value.primarykeyduid]) {
        this.editService.editedItems[formGroup.value.primarykeyduid] = [];
    }
      for (let key in formGroup.controls) 
      {
        var primaryKeyValue: number = formGroup.get('primarykeyduid').value;
        if (formGroup.get(key).dirty || primaryKeyValue<0) {
              if(primaryKeyValue<0 && (formGroup.get(key).value===null ||(formGroup.get(key).value!==null && formGroup.get(key).value==="")))
                continue;
              if(this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]["isreadonly"]===true)
                continue;
              if(this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]["type"]==="list")
                continue;
            if (this.editService.editedItems[formGroup.value.primarykeyduid].indexOf(key) === -1) {
                this.editService.editedItems[formGroup.value.primarykeyduid].push(key);                
            }
        var reqdAttribute = this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]['attribute'];
        var columnType=this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]["type"];
        var selectValue = formGroup.get(key).value;
        if(columnType==="dropdown")
          selectValue = this.GetDropDownId(key,selectValue);
        this.generalTemplateHelper.PushUpdateTable(primaryKeyValue,
          selectValue, reqdAttribute,this.tableName, this.editService.updatetable) ;
        }
      }

      this.editService.assignValues(dataItem, formGroup.value);
      this.editService.update(dataItem);
    }
}

public addHandler(args: AddEvent): void {
  this.editService.isNewRow = true;
   args.sender.addRow(this.generalTemplateHelper.createNewFormGroup(null,this.data,this.columns,0));
}

public cancelHandler(args: CancelEvent): void {
  this.editService.isNewRow = false;

  args.sender.closeRow(args.rowIndex);
}

public saveHandler(args: SaveEvent): void {
    if (args.formGroup.valid) {
      //To add new rows info
        this.editService.create(args.formGroup.value);
        args.sender.closeRow(args.rowIndex);
        this.view = this.editService.pipe(
          map((data) => process(data, this.gridState))
        );
        this.GetGridItem();
    }
}

public removeHandler(args: RemoveEvent): void {
    this.editService.remove(args.dataItem);

    args.sender.cancelCell();
}

public saveChanges(grid: GridComponent): void {
    grid.closeCell();    
    this.grid.closeRow(0) ;
    if(this.childComponent !=undefined)
    {
      this.childComponent.saveChanges();
      if(this.childComponent.updatetable.length>0)
      {
        var childUpdateDetails = this.childComponent.updatetable;
        for(var childUpdateData of childUpdateDetails)
        {
          let indexTableToUpdate  = this.editService.updatetable.findIndex(item =>item.tablename === childUpdateData.tablename  && item.modetype===childUpdateData.modetype);    
          if(indexTableToUpdate>-1)
          {
            this.editService.updatetable.splice(indexTableToUpdate, 1, childUpdateData);
          }
          else
            this.editService.updatetable.push(childUpdateData);
        }        
      }
    }
    this.editService.AddDeletedItems(this.tableName);
    var pageNametoSend = this.pageName;
    if(this.tableType  != undefined && this.tableType == 'simple')
      pageNametoSend = 'DataUpdate';
    this.editService.saveChanges(AppConfig.settings.apiUrl,this.bvNumber, pageNametoSend);          
}

public cancelChanges(grid: GridComponent): void {
  this.editService.cancelChanges();
  this.data = this.data = [...this.globalData]; 
  this.dataservice.processArray(this.filteredArray,this.data, this.storageService,this.columns).then((data) => {
    this.data = this.dataservice.gridData;
  }) 
  this.grid.closeRow(0);
  let counter :number =0;
  this.data.forEach((item, idx) => {
    this.grid.collapseRow(idx);
    this.grid.closeRow(counter);
    counter = counter +1;
    
  })
    grid.cancelCell();
    this.editService.isNewRow = false;  
    
    if(this.childComponent!= undefined)
    {
      this.childComponent.cancelChanges();
    }
   this.editService.updatetable=[];
   grid.data = this.editService.data;
}


public onStateChange(state: State): void {
  this.gridState = state;
  this.editService.read(this.data);
}
public columnResized(state: any): void {
  for (let column of this.gridSettings.columnsConfig) {
    if(column.title == state[0].column.title)
    {
      column.width = state[0].newWidth;
      break;
    }
  }
  this.saveGridSettings();
}


public columnVisibilityChanged(state: any): void {
  for (let column of this.gridSettings.columnsConfig) {
    if(column.title == state.columns[0].title)
    {
      column.hidden = state.columns[0].hidden;
      break;
    }
  }
  this.saveGridSettings();
}


public columnLockedChange(lock: any): void {
  for (let column of this.gridSettings.columnsConfig) {
    if(column.title == lock.columns[0].title)
    {
      //column.locked =lock.columns[0].locked;
      column.locked =false;
      break;
    }
  }
  this.saveGridSettings();
}

public editHandler(args: AddEvent): void {
  this.isEditing = !this.isEditing;
   // this.currentEditColumn = this.isEditing ? columnField : null;
   this.editDataItem = args.dataItem;
}
isEditing: boolean = false;
currentEditColumn: string | null = null;
isPlaying(dataItem: any): boolean {
  return this.isPlayingMap.get(dataItem) || false;
}
public readonly tlpModeFilterValues = [
  { text: 'No activity', value: 0 },
  { text: 'auto.', value: 1 },
  { text: 'manual', value: 2 },
];

public isEditMode = false;

// Define a method to toggle edit mode
toggleEditMode() {
  this.isEditMode = !this.isEditMode;
}
//public selectedDropdownValues: { [key: string]: number } = {};
public selectedDropdownValues: { key: string, value: { [subKey: string]: number } }[] = [];

public resetSelectedDropdownValues() {
  this.selectedDropdownValues = [];
}
/**
 * name
 */
public GetData(key : string)  : any[] {
  var arrayValues:any[];
  if(this.columnFilterValues[key]!==undefined)
    arrayValues = this.columnFilterValues[key].map(item => item.Text);
  else
    arrayValues= null;
  return arrayValues;
}
public onDropdownValueChange(value: any, field: string, event :any): void {
  this.data.filter(i=>i.primarykeyduid ==value['primarykeyduid'])[0][field] = event
  value[field] = event;
  this.masterDropdowValue1  = event ;
  var selectedId = this.GetDropDownId(field,event);
  this.UpdateEditItemPushUpdateTable(value['primarykeyduid'],field,value,selectedId);
}
togglePlay(dataItem: any) {
    const currentStatus = this.isPlaying(dataItem);
    this.isPlayingMap.set(dataItem, !currentStatus);

    if (this.isPlaying(dataItem)) {
      this.isPlayingMap.forEach((value, key) => {
        if (key !== dataItem) {
          this.isPlayingMap.set(key, false);
        }
      });

      if (this.audioService.isPaused) {
        this.audioService.play();
      } else {
        this.audioService.playStream(dataItem.audioData, dataItem.index).subscribe(
        () => {},
          error => {
            // Handle error if any
          }
        );
      }
    } else {
      this.audioService.pause();
    this.audioService.clearActiveItem();
  }

  if (this.audioService.isEnded()) {
    this.isPlayingMap.set(dataItem, false);
    this.audioService.clearActiveItem();
  }
}

public showDetails(dataItem)
{
  this.togglePlay(dataItem);
  if(this.isAudioPaused === true)
  {
    this.audioService.play();
    this.isAudioPaused = false ;
    }
    // else
    //   this.PlayAnnouncement(dataItem.primarykeyduid);
  //item.isPlaying = false;
}

public  pause(dataItem)
{
  this.togglePlay(dataItem);

  this.isAudioPaused = true;
  this.audioService.pause();
}

public columnReorder(grid: any): void
 {
  // const columns = grid.columns;
  //   const gridConfig = {
  //     state: this.gridSettings.state,
  //     tableName:this.pageName,
  //     columnsConfig: columns.toArray().map((item) => {
  //       return <ColumnSettings>{
  //         field: item['field'],
  //         title: item['title'],
  //         width: item['width'],
  //         type : item['type'],
  //         filter : item['filter'],
  //         hidden : item['hidden'],
  //         locked: item['locked'],
  //         orderIndex: item['orderIndex'],
  //       };
  //     }),
  //   };
  //   this.storageService.addItem(gridConfig,'TableSettings',this.pageName);
  //   this.ParseJSON();

  //   this.gridSettings = JSON.parse(JSON.stringify(gridConfig));;
  //   this.savedGridSettings == JSON.parse(JSON.stringify(gridConfig));;
}

public saveGridSettings(): void {
  const gridConfig = {
    tableName:this.pageName,
    columnsConfig : this.gridSettings.columnsConfig,
    state: this.gridSettings.state,
  };
this.storageService.addItem(gridConfig,'TableSetting',this.pageName);

this.gridSettings = JSON.parse(JSON.stringify(gridConfig));;
this.savedGridSettings == JSON.parse(JSON.stringify(gridConfig));
}
public GetDropDownId(columnField: string, selectedValue: any): string {
  const filterValues =  this.columnFilterValues[columnField];
 if (filterValues && filterValues.length > 0) {
  const matchingValue = filterValues.find(item => item.Text == selectedValue);
  if(matchingValue == undefined)
  return '';
else
return  matchingValue.Value ;
 }  
  return ''; // Return an empty string if no matching value is found
}
  
public GetDropDownValue(columnField: string, selectedValue: any): string {
  const filterValues =  this.columnFilterValues[columnField];
 const selectedRow =  this.data.filter(i=>i.primarykeyduid == selectedValue['primarykeyduid'])[0]
 if (filterValues && filterValues.length > 0) {
  const matchingValue = filterValues.find(item => item.Value == selectedRow[columnField]);
  if(matchingValue == undefined)
  return '';
else
return  matchingValue.Text ;
 }
  
  return ''; // Return an empty string if no matching value is found
}

public GetSelectedValue(columnField: string,value : any): any {
  //   this.data.filter(i=>i.primarykeyduid ==value['primarykeyduid'])[0][field] = event
  // value[field] = event;
    return value[columnField];
}
  public onSelect({ dataItem, item }): void {
    
    if (!this.isFirstColumn) {
      switch (item.label) {
        case "What's this":
          alert("open help to be implemented");
          break;
        case "Cut":
          this.clipboard.copy(this.selectedCellData.join(' '));
          this.CutSelectedData();
         // alert("open help to be implemented");
          break;
        case "Auto Complete(copy first cell)":
          this.AutoCompleteCopyFirstCell();
          break;
        case "Auto Complete(data series)":
          this.AutoCompleteSeries();
          break;
        case "Free Number Search":
          alert("To be implemented");
          break;
        //row header
        case "Copy":
          this.prevSelectedCellData = this.selectedCellData;
          this.clipboard.copy(this.selectedCellData.join(' '));
          break;
        case "Paste":
          this.PasteFromClipboard(this.prevSelectedCellData);
          break;
        case "Call Up Record":
          this.CallUpRecord(this.selectedColumnIndex);
          break;
      }
    }
    //row header context menu
    if (this.isFirstColumn) {
      switch (item.label) {
        case "Clone":
          this.CopyRows();
          this.PasteFromClipboardData(this.grid);
          break;
        case "Delete":
          this.DeleteRows();
          break;
        case "GeoEditor":
        this.OpenMap();
        break;
      }
    }

    switch (item.label) {
      //column header
      case "Toggle Group Panel":
        this.groupable = !this.groupable;
        break;
      case "Toggle Filter Row":
        if(this.filterable === 'menu')
          this.filterable = 'menu, row';
        else
          this.filterable = 'menu'
        break;
      case "Clear Filters":
        this.filter ={
          logic: 'or',
          filters: []
        };
        break;
      case "Clear Sort Order":
        this.gridSettings.state.sort = [];
        break;
      //table
      case "Export to Excel":
        this.exportToExcel();
        break;
      case "Print":
        this.Print();
        break;
      case "Auto Fit Columns":
        this.PasteFromClipboard(this.selectedCellData);
        break;
      case "Unfreeze Columns":
        this.PasteFromClipboard(this.selectedCellData);
        break;
      case "Expand All Groups":
        this.expandedKeys = [];
        this.initiallyExpanded = true;
        break;
        case "Collapse All Groups":
          this.expandedKeys = [];
    this.initiallyExpanded = false;
          break;
    }
    this.gridFunction.BuildContextMenuItems();
  }

  private CopyRows(): void {
    var copyData = JSON.stringify(this.rowData);
    this.clipboard.copy(copyData);
  }
  private DeleteRows(): void {
    this.editService.remove(this.rowData);
  }
private CutSelectedData() {
  this.selectedCellData = [];
  const gridData = this.grid.data as GridDataResult;;
  this.kendoSelection = this.kendoSelection.sort(this.generalTemplateHelper.CompareItems);
  for (const row of this.kendoSelection) {
    const columnComponent = this.visibleColumns[row.columnKey-1];// this.grid.columns.toArray()[row.columnKey] as ColumnComponent;
    const field = columnComponent.field;
    gridData[row.itemKey][columnComponent.field] = '';
  }
  this.grid.closeCell();
}

private AutoCompleteCopyFirstCell(){
  const gridData = this.grid.data as GridDataResult;

  for (const row of this.kendoSelection) {
    const field = this.visibleColumns[row.columnKey-1];// columnComponent.field;
    gridData.data[row.itemKey][field.field] = this.firstSelectedCellData;
    const currentRow = gridData.data[row.itemKey];
    const primarykeyduid = currentRow['primarykeyduid'];
    var columnType=field.type;
    var selectValue = this.firstSelectedCellData;
    if(columnType==="dropdown")
      selectValue = this.GetDropDownId(field.field,selectValue);
    this.UpdateEditItemPushUpdateTable(primarykeyduid,field.field,currentRow,selectValue)
  this.grid.closeCell();
  }
  
}

// this is mainly used for the autocomplete , when we want to add the edititems(for color)
//and invoke the PushUpdateTable for updateTable
private UpdateEditItemPushUpdateTable(primarykeyduid : number,field :string,currentRow :any,value : any ){
  if (!this.editService.editedItems[primarykeyduid])  
      this.editService.editedItems[primarykeyduid] = [];

      if (this.editService.editedItems[primarykeyduid].indexOf(field) === -1)  
        this.editService.editedItems[primarykeyduid].push(field);                

    this.editService.assignValues(currentRow,currentRow);
    this.editService.update(currentRow);

    var reqdAttribute = this.columns.filter((column)=>column.field.toLowerCase() ===field)[0]['attribute'];
    this.generalTemplateHelper.PushUpdateTable(primarykeyduid,
      value, reqdAttribute,this.tableName, this.editService.updatetable) ;
}
private AutoCompleteSeries(){
  const gridData = this.grid.data as GridDataResult;
  let kendoSelectionColumnWise: CellSelectionItem[] = [];
  kendoSelectionColumnWise = this.kendoSelection.sort(this.generalTemplateHelper.CompareItemsColumnWise);

  let prevColumnIndex : number = -1;
  let firstCellRow : string;
  let isFirstCell : boolean = true;
  for (const row of kendoSelectionColumnWise) {
 // const columnComponent = this.grid.columns.toArray()[row.columnKey] as ColumnComponent;
 const columnComponent = this.visibleColumns[row.columnKey-1];// columnComponent.field;
    
 if(prevColumnIndex != row.columnKey){
   firstCellRow = gridData.data[row.itemKey][columnComponent.field];
    }
    else
    firstCellRow = firstCellRow + 1;
    prevColumnIndex = row.columnKey;
    gridData.data[row.itemKey][columnComponent.field] = firstCellRow;
    const currentRow = gridData.data[row.itemKey];
    const primarykeyduid = currentRow['primarykeyduid'];
    var columnType=columnComponent.field.type;
    var selectValue = this.firstSelectedCellData;
    if(columnType==="dropdown")
      selectValue = this.GetDropDownId(columnComponent.field.field,selectValue);
    this.UpdateEditItemPushUpdateTable(primarykeyduid,columnComponent.field,currentRow,selectValue)
  }
  this.grid.closeCell();

}

ConvertDataToRowColumn(selectedCellData : any) :  string[][]
{
  const rows: string[][] = [];
  let currentRow: string[] = [];
  for (const cell of selectedCellData) {
    if (cell === '\n') {
      rows.push(currentRow);
      currentRow = [];
    } else {
      if (cell !== '\t')
        currentRow.push(cell);
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  return rows;
}

PasteFromClipboard(selectedCellData: any) {
  if(selectedCellData.length == 0)
  {
    this.userNotificationService.showInfo("No data to paste");
    return;
  }
  const rows: string[][] = this.ConvertDataToRowColumn(selectedCellData);

  const gridData = this.grid.data as GridDataResult;
  this.kendoSelection = this.kendoSelection.sort(this.generalTemplateHelper.CompareItems);
  let itemKey : number = this.kendoSelection[0].itemKey;
  let columnKey : number = this.kendoSelection[0].columnKey;
  let columnComponent : any;
  for (const row of rows) {
      columnKey = this.kendoSelection[0].columnKey;
    const currentRow = gridData.data[itemKey];
    const primarykeyduid = currentRow['primarykeyduid'];
    for (const column of row)
    {
       columnComponent = this.visibleColumns[columnKey-1] ;//this.grid.columns.toArray()[columnKey] as ColumnComponent;
      gridData.data[itemKey][columnComponent.field] = column;
      columnKey = columnKey + 1;
      this.UpdateEditItemPushUpdateTable(primarykeyduid,columnComponent.field,currentRow,this.firstSelectedCellData)
    }
    itemKey = itemKey + 1;
  }
}

//this is for the control V which the user performs on the grid 
PasteOnGrid(selectedCellData: any) {
  if(selectedCellData.length == 0)
  {
    this.userNotificationService.showInfo("No data to paste");
    return;
  }
  const rows: string[][] = this.ConvertDataToRowColumn(selectedCellData);
  this.visibleColumns =  this.columns.filter(h=>h.hidden == false)
  var counter =0;
  for(var i=0;i<selectedCellData.length-1;i++)
  {
    var result = this.generalTemplateHelper.createNewFormGroup(null,this.data,this.columns,0);
    this.editService.save(result.value,true);
    this.grid.data = this.editService.data;
    this.grid.editRow(counter, result);
  }

  const gridData = this.grid;
  let itemKey : number = 0;
  let columnKey : number = 0;
  let columnComponent : any;
  for (const rowData of selectedCellData) {
    const currentRow = gridData.data[itemKey];
    columnKey = 0;
    const primarykeyduid = currentRow['primarykeyduid'];
    Object.entries(rowData).forEach(([columnName, columnValue]) => {
      // Assuming this.visibleColumns is an array of visible column definitions
      const columnComponent = this.visibleColumns[columnKey];
      columnKey = columnKey +1;
      // Ensure columnComponent is defined
      if (columnComponent) {
        // Assuming gridData.data is an array of data items
        gridData.data[itemKey][columnComponent.field] = columnValue;
        var columnType=columnComponent.type;
        var selectValue = columnValue;
        if(columnType==="dropdown")
          selectValue = this.GetDropDownId(columnComponent.field,selectValue);
        // Assuming UpdateEditItemPushUpdateTable is a function that you've defined elsewhere
        this.UpdateEditItemPushUpdateTable(primarykeyduid, columnComponent.field, currentRow, selectValue);
      }
    });
    itemKey = itemKey + 1;
    if(itemKey==selectedCellData.length-1)
      break;
  }
  this.grid.closeCell();
  this.grid.closeRow(0) ;
}

private CallUpRecord(columnValIndex:number){
  this.generalTemplateService.emitEvent({ message: 'links' });
  }
 

PasteFromClipboardData(grid) {  
  this.masterDropdowValue1 =   { Text: '' };
 this.addNewRowData(grid,true);
}
private editedRowIndex: number;
addrow(grid:GridComponent) {  
  this.masterDropdowValue1 =   { Text: '' };
  this.addNewRowData(grid,false);
 }
addNewRowData(grid:GridComponent,bclone:boolean) {
let counter : number = 0;
  let result: any;
  if(bclone)
   result = this.generalTemplateHelper.createNewFormGroup(this.rowData,this.data,this.columns,0);
  else
    result = this.generalTemplateHelper.createNewFormGroup(null,this.data,this.columns,0);
  this.editService.save(result.value,true);
  grid.data = this.editService.data;
  grid.editRow(counter, result);
  counter= counter+1;
  this.editedRowIndex = grid.data.length - 1;
  //this.grid.closeCell();
  
}

public exportToExcel() {
  // Save the updated grid data as Excel
  this.grid.data = this.data;
  this.grid.saveAsExcel();
}

  public printing = false;
  public Print(): void {
    this.applyPrintStyle();
    window.print();
    this.removePrintStyle();
  }
  private applyPrintStyle(): void {
    const printableGrid = document.querySelector('.printable-grid');
    if (printableGrid) {
      printableGrid.classList.add('printable');
    }
  }

  private removePrintStyle(): void {
    const printableGrid = document.querySelector('.printable-grid');
    if (printableGrid) {
      printableGrid.classList.remove('printable');
    }
  }
  public colorCode(dataitem:any,code: string): SafeStyle {
    let result = this.generalTemplateHelper.colorCode(dataitem,code,this.editService.editedItems);
    return this.sanitizer.bypassSecurityTrustStyle(result);
  }
    public fontColor(code: string): SafeStyle {
    let result = this.generalTemplateHelper.fontColor(code);
    return this.sanitizer.bypassSecurityTrustStyle(result);
}

public showTooltip(e: MouseEvent): void {
  const element = e.target as HTMLElement;
  if (
     element.className === 'k-column-title' 
  ) {
    this.tooltipDir.toggle(element);
  } else {
    this.tooltipDir.hide();
  }
}
public isEdited(dataItem: any, columnfield: string): boolean {
  if (this.editService.editedItems[dataItem.primarykeyduid]?.length && this.editService.editedItems[dataItem.primarykeyduid]?.indexOf(columnfield) > -1) {
      return true;
  } 
  else if (dataItem.primarykeyduid<0) 
  {
    return true;
  }
  else {
      return false;
  }
}

public ContainChildTable(): boolean {
  if (this.childpageName.length > 0) {
      return true;
  } else {
      return false;
  }
}

ContainsChildTable(): Observable<boolean> {
  
   if (this.childpageName.length > 0) {
    return new Observable<boolean>(observer => {
      //const subscription = this.dataservice.dataLoaded.subscribe(loaded => {
        //if (loaded) {
          observer.next(true);
          observer.complete();
          this.loading = false;
          this.resetload = true
        //}
      });
      //return () => subscription.unsubscribe();
    //});
  } else 
  {
    return new Observable<boolean>(observer => {
      observer.next(false);
      observer.complete();
      this.loading = false;
    });
  }
}
public OpenLinksColumn()
{
  alert("To be implemneted");
}
expandedPrimaryKey:number=-99;
previousselectedindex:number=-99;
onExpand(e:DetailExpandEvent) {  
  if(this.resetload == false)
      this.loading = true;
   
  if( this.editService.hasChildChanges() || this.editService.hasChanges())
  {
    e.preventDefault();
    if(window.confirm('There are unsaved changes in the current row. Are sure you want to cancel the changes ?')){
      this.data.forEach((item, idx) => {
        this.grid.collapseRow(idx);
      });
      this.grid.closeCell();
      this.grid.cancelCell();
      this.grid.closeRow(0) ;
      this.grid.expandRow(e.index);
      this.expandedPrimaryKey = e.dataItem["primarykeyduid"] as number;
      this.selectedRowIndex = e.index;
      this.previousselectedindex = this.selectedRowIndex;
     }
     else
     {
      this.selectedRowIndex = this.previousselectedindex;
     }
  }
  else
  {
    this.data.forEach((item, idx) => {
      this.grid.collapseRow(idx);
    });
    this.grid.expandRow(e.index);
    this.expandedPrimaryKey = e.dataItem["primarykeyduid"] as number;
    this.selectedRowIndex = e.index;
    this.previousselectedindex = this.selectedRowIndex;
  }
  
}

onCollapse(e:DetailCollapseEvent) {
  
}
public onExcelPaste(data: any[]): void {
   this.PasteOnGrid(data);
}
onColumnPaste(event: { column: string, data: any[] }) {
  const columnName = event.column;
  const pastedData = event.data;
  
  // Handle the paste event for the specific column
  console.log(`Pasted data for column ${columnName}:`, pastedData);
}

public reloadvalues(returnprimaryKeys:PrimaryKeyValues[]) {
   returnprimaryKeys.forEach((item,idx) => {
      if(item.tablename==this.tableName)
      {
        var fetchItem = this.data.find(p=>p.primarykeyduid===item.primarykey);
        if(fetchItem!=undefined)
        {
            fetchItem["primarykeyduid"]=item.keyvalue;
        }
      }
      else if(this.childComponent!=undefined && this.childTableName==item.tablename)
      {
        var fetchItem = this.childComponent.service.data.find(p=>p.primarykeyduid===item.primarykey);
        if(fetchItem!=undefined)
        {
            fetchItem["primarykeyduid"]=item.keyvalue;
        }
      }
    })
    if(this.childComponent !=undefined)
        {
            this.childComponent.editedItems = {}; // reset the dirty items
            this.childComponent.updatetable = [];
            this.childComponent.service.reset();
        } 
        this.grid.closeCell();
        this.grid.cancelCell();
    this.grid.closeRow(0) ;
    localStorage.removeItem(this.pageName.toLowerCase());
    if(this.ContainsChildTable)
    {
      var url : string = AppConfig.settings.apiUrl+'/'+this.childpageName.toLowerCase()+'/'+this.bvNumber
      if(this.childpageName == 'patternsequences')
      {
          var routeIndex: number
          routeIndex = this.data[0]['routeindex']
           url = AppConfig.settings.apiUrl+'/'+this.childpageName.toLowerCase() + AppConfig.settings.templateExtension+'/'+this.bvNumber+'/'+routeIndex
      }
       this.dataservice.fetchDataFromApi(this.childpageName.toLowerCase(), AppConfig.settings.apiUrl+'/'+this.childpageName.toLowerCase()+'/'+this.bvNumber,true).then(async (data) => {
        this.loading=true;
        this.data.forEach((item, idx) => {
          this.grid.collapseRow(idx);
          if(item["primarykeyduid"]===this.expandedPrimaryKey)
          {
            this.grid.expandRow(idx);
          }
          
        })
        this.loading=false;
      });
    }
  }
  private refreshMainGrid:boolean=false;
  private refreshChildGrid:boolean = true;
  public reload(isSave : boolean ) {
    if(!isSave)
      this.cancelChanges(this.grid);
    if(this.childComponent !=undefined && this.editService.hasChildChanges())
      this.childComponent.cancelChanges();
    this.loading=true;
    const apiUrl = AppConfig.settings.apiUrl;
    
    if(!isSave)
      this.userNotificationService.showInfo("Data reloaded");
    if(this.tableType  != undefined && this.tableType == 'simple')
    {
      var counter : number =0

      this.LoadSimpleTable();
       this.data.forEach(()=>
        {
          this.grid.closeRow(counter);
          counter = counter +1;

        }
      )
      return;
    }  
    if(this.ContainsChildTable())
    {
      this.refreshChildGrid = false;
      if(this.childpageName.toLowerCase()=='stoppoints')
      {
        var currenturl = AppConfig.settings.apiUrl+'/'+this.childpageName.toLowerCase() + AppConfig.settings.templateExtension;
        if(AppConfig.settings.templateExtension=='')
          currenturl = currenturl +'/'+this.bvNumber;
        this.storageService.removeItem('TableValue',this.bvNumber+this.childpageName.toLowerCase());          
        this.dataservice.fetchDataFromApi(this.childpageName.toLowerCase(), currenturl,true).then(async (data) => 
        {
        });
      }
      this.refreshChildGrid=true;
      if(this.childComponent !=undefined)
      {          
        this.childComponent.ngOnInit();          
        if(this.refreshMainGrid && this.refreshChildGrid)
          {
            this.data.forEach((item, idx) => {
                this.grid.collapseRow(idx);
                this.grid.closeRow(counter);
                counter = counter +1;
                if(item["primarykeyduid"]===this.expandedPrimaryKey)
                {
                  this.grid.expandRow(idx);
                }
              })
          }
      }
      if(this.refreshMainGrid && this.refreshChildGrid)
        this.loading=false;
    }
    var  dataFileName = apiUrl+"/"+this.pageName.toLowerCase()+ AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')
       dataFileName = dataFileName +'/'+this.bvNumber;
    this.storageService.removeItem('TableValue',this.bvNumber+this.pageName.toLowerCase());
    this.dataservice.fetchDataFromApi(this.pageName.toLowerCase(), dataFileName,false).then( (newdata) => 
    //this.http.get<any[]>(dataFileName).subscribe(newdata => 
        {
          var dateFilteredArray = this.columns.filter(p=>p.type === "date");
            for (const element of dateFilteredArray)
            {
              newdata.map((item) => {
                if (element.type === "date") {
                    item[element.field] = new Date(item[element.field]);
                  }
                });
            }
          this.data = newdata;
          
          this.editService.read(this.data);
          this.refreshMainGrid=true;
          if(this.refreshMainGrid && this.refreshChildGrid)
          {
            if(this.ContainsChildTable())
            {
              this.data.forEach((item, idx) => {
                this.grid.collapseRow(idx);
                if(item["primarykeyduid"]===this.expandedPrimaryKey)
                {
                  this.grid.expandRow(idx);
                }
              })
            }
            this.loading=false;
          }          
        });
    this.grid.closeCell();
    var counter : number =0
   
    }

  private  LoadSimpleTable()
    {
      let fetchTable: FetchData[]=[];
      var fetchData = new FetchData();
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json', // Set the Content-Type header to JSON
        }),
      };
      fetchData.tablename = this.tableName;
      
      var  updatedValueList = this.columns.map(item => {
        const attributeInfo = new AttributeInfo();
        attributeInfo.attributename = item.attribute;
        attributeInfo.usageTable = item.usageTable || ''  ;
        attributeInfo.usageColumn = item.usageColumn || ''  ;
        attributeInfo.usageProvider = item.usageProvider || ''  ;
        return attributeInfo;
      });

      fetchData.attributelist = updatedValueList;

      fetchTable.push(fetchData);

          this.http.post(AppConfig.settings.apiUrl + '/' + 'DataFetch' + '/' + 1, fetchTable, httpOptions)
            .subscribe(
              (response: any) => {
                this.data = [];
                this.data = response;
                this.editService.read(this.data);
                this.grid.data = this.data;
                this.loading=false;
                this.grid.cancelCell();
              },
              (error) => {
                console.log('Unexpected response:', error);
                this.loading=false;
              }
            )
    }

    public OpenMap(): void 
    {      
      var queryParams: IMapQueryParams = { bvNumber:this.bvNumber };
      if(this.pageName.toUpperCase()==="STOPS")
        queryParams.selectedStopId =  this.rowData['primarykeyduid'];
      else if(this.pageName.toUpperCase()==="PATTERNS")
      {
        queryParams.selectedPatternId =  this.rowData['primarykeyduid'];
        queryParams.routeindex = this.rowData['routeindex'];
      }
      Utils.openInNewWindow(['geoeditor'], queryParams, false, screen.availWidth, screen.availHeight);
    }

}


