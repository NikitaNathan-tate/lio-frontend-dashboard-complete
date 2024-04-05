import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { BehaviorSubject, Observable, debounce, fromEvent, map, merge, of, timer } from "rxjs";
import { CellClickEvent, CellCloseEvent, CellSelectionItem, ColumnComponent, ColumnMenuSettings, FilterableSettings, GridComponent, GridDataResult, GridSize, MultipleSortSettings, PageChangeEvent, RowArgs, SelectableMode, SelectableSettings, SelectionEvent } from "@progress/kendo-angular-grid";

import { DetailsService } from "../nestedservice";
import { CompositeFilterDescriptor, SortDescriptor, State, filterBy, orderBy, process } from '@progress/kendo-data-query';
import { FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from "@angular/forms";
import {  UpdateTable } from "../../general-template/model/model";
import { HttpClient } from "@angular/common/http";
import { StorageService } from "src/app/storage/storageservice";
import GeneralTemplateHelper from "../../general-template/general-template/generaltemplatehelper";
import { CloudService } from "src/app/shared/audio/services/cloud.service";
import { Clipboard } from '@angular/cdk/clipboard';
import { GridSettings } from "../../general-template/services/grid-settings.interface";
import { Keys } from "@progress/kendo-angular-common";
import { NestedGridFunction } from "../nestedgridfunctions";
import { ChildGridContextMenuComponent } from "src/app/shared/contextmenu/childgrid-context-menu/childgrid-context-menu.component";
import { MenubarComponent } from "src/app/shared/menubar/components/menubar/menubar.component";
import { ExcelExportData  } from '@progress/kendo-angular-excel-export';
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

@Component({
  selector: "app-details",
  providers: [DetailsService],
  template: `
    <kendo-grid #gridDetail
      [data]="view | async"
      [size]="smallSize"
      [loading]="view['loading']"
      [filter]="filter"
      scrollable="virtual"
      [skip]="skip"        
      [sort]="sort"
      [sortable]="sortSettings"  
      (sortChange)="sortChange($event)"
      [pageSize]="5"      
      [reorderable]="true"
      [filterable]="false"
      (filterChange)="filterChange($event)"
      [resizable]="true"  
      [columnMenu]="menuSettings"
      [selectable]="selectableSettings"
      [rowSelected]="isRowSelected"
      (selectionChange)="selectionChangeHandler($event)"
      kendoGridSelectBy
      [(selectedKeys)]="kendoSelection"
      (cellClick)="cellClickDetailsHandler($event)"
      (cellClose)="cellCloseDetailsHandler($event)"
      (pageChange)="pageChange($event)"
      [navigable]="true"
      kendoGridFocusable
      contextmenu="cellClickDetailsHandler($event)"
    >
    <kendo-grid-column  [width]="50" [locked]="false" title="" [headerClass]="'headerCustomClass'"  column>
      <ng-template kendoGridCellTemplate let-rowIndex="rowIndex">
        
        <div class="context-menu-cell-detail"  aria-disabled="true">
          {{ rowIndex + 1 }}
        </div>
      </ng-template>
    </kendo-grid-column>
    <ng-container *ngFor="let column of columns">
    <kendo-grid-column #columnDetail [hidden]=column.hidden  [field]="column.field" [title]="column.title" [width]="column.width" [filter]="column.filter" 
    >
    <ng-template kendoGridCellTemplate let-dataItem  >
    <ng-container *ngIf="column.type === 'dropdown'">
          <ng-template  kendoGridEditTemplate  let-dataItem="dataItem">
            <!-- Edit mode: Show the dropdown -->
            <kendo-dropdownlist style="height:1.5rem;" 
              [data]="columnFilterValues[column.field]"
              textField="Text"
              valueField="Value"
              [(ngModel)]="masterDropdowValue1"
              (valueChange)="onDropdownValueChange(dataItem, column.field,$event)"
            ></kendo-dropdownlist>
          </ng-template>
          <ng-container>
            <span
            class="whole-cell" style="height:8px;" 
            [style.backgroundColor]="colorCode(dataItem,column.field )"
              [style.color]="fontColor(dataItem[column.field] )" >
            {{ GetDropDownValue(column.field, dataItem) }}</span>
          </ng-container>
        </ng-container>
        <ng-container *ngIf="column.type === 'list'">
          <ng-container *ngIf="column.type === 'list'">
            <span [attr.readonly]="true">{{ dataItem[column.field] }}</span>
       <ng-container *ngIf="column.isLinkButtonVisible === true">
        <button kendoButton [textContent]="dataItem[column.field]"  fillMode="clear"
          style="font-weight:normal ; margin-top: 0;padding-top:  0;padding-bottom: 0;padding-left: 0;padding-right: 0; ">...</button>
     </ng-container>
     </ng-container>
    </ng-container>    
    <ng-container *ngIf="column.type !== 'dropdown' && column.type !== 'list'">

      <ng-template *ngIf="!column.isreadonly "
          kendoGridEditTemplate
          let-column="column"
          let-formGroup="formGroup"
          let-isNew="isNew"
        >
          <kendo-textbox
            #input="popupAnchor"
            popupAnchor
            [formControl]="formGroup.get(column.field)"
          ></kendo-textbox>
          <kendo-popup
            [anchor]="input.element"
            *ngIf="
              formGroup.get(column.field).invalid && !column.isreadonly &&
              !(isNew && formGroup.get(column.field).untouched)
            "
            popupClass="k-widget k-tooltip k-tooltip-validation k-invalid-msg"
          >
            <span class="k-icon k-font-icon k-i-exclamation-circle"></span>
            {{validationmessage}}
          </kendo-popup>
        </ng-template>
        {{ dataItem[column.field] }}
    </ng-container>
    </ng-template>
    </kendo-grid-column>
  </ng-container>
  <kendo-grid-excel fileName={{fileName}}></kendo-grid-excel>
   </kendo-grid>
   <childgrid-context-menu [for]="gridDetail"  [generalContextMenuItemsChild]="gridContextMenuItems" [getRowNumberContextMenuItemsChild]="gridRowHeaderContextMenuItems"
[getColumnHeaderContextMenuItemsChild]="getColumnHeaderContextMenuItems" [getTableHeaderContextMenuItemsChild]="getTableHeaderContextMenuItems" (selectChild)="onDetailSelect($event)">
</childgrid-context-menu>
  `,
  styles: [
    `
      .headerCustomClass {
        color: #fff;
      }
    `,
  ],
})
export class DetailComponent implements OnInit {

 
  @Input() public parenttable: any;
  @Input() public pageName: string;
  @Input() public parentpageName: string;
  @Input() public tableName: string;
  @Input() public bvNumber: number;
  public view: Observable<any[]>;
  public selectedColumnIndex: number;
  public selectedRowIndex: number;
  public columns: any[];
  public isLoading: boolean;
  public rowData: any ;
  public skip = 0;
  public smallSize: GridSize = 'medium';
  public selectableSettings: SelectableSettings;
  public mode: SelectableMode = 'multiple';
  public drag = true;
  public sort: SortDescriptor[] = [];
  public gridContextMenuItems: any[] = [];
  public gridRowHeaderContextMenuItems: any[] = [];
  public getColumnHeaderContextMenuItems: any[] = [];
  public getTableHeaderContextMenuItems: any[] = [];
  public isFirstColumn : boolean = false;
  private gridFunction : NestedGridFunction;
  public fileName : string;
  public editedItems: any = {};
  public updatetable: UpdateTable[]=[];
  public filter: CompositeFilterDescriptor={
    logic: 'or',
    filters: []
  };
  public gridState: State = {
    skip: 0,
    take: 50,
    sort: []
  };
  public gridSettings: GridSettings;
  public savedGridSettings: GridSettings;
  public generalTemplateHelper: GeneralTemplateHelper = new GeneralTemplateHelper(this.formBuilder);
public filterable: FilterableSettings='menu, row';
  public validationmessage : string;
  public columnFilterValues: { [key: string]: any[] } = {};
  dropdownData: any[]; // The items for the dropdown
  selectedItem: string;  // The selected item in the dropdown
  public masterDropdowValue1: { Value: number, Text: string } ;

  constructor(private formBuilder: FormBuilder,public service: DetailsService,private http: HttpClient,
    public storageService: StorageService, public cloudService: CloudService, private clipboard: Clipboard, private menubarComponent:MenubarComponent,private sanitizer: DomSanitizer) 
    {

      this.gridFunction= new NestedGridFunction(this);
      this.setSelectableSettings();
      
      this.gridFunction.BuildContextMenuItems();
  
    }
  @ViewChild(GridComponent) private gridDetail: GridComponent;
  //@ViewChild(ChildGridContextMenuComponent) private childContextMenuDetail: ChildGridContextMenuComponent;
  public async ngOnInit(): Promise<void> {
    
    this.bindKeypressEvent().subscribe(($event: KeyboardEvent) => this.onKeyPress($event));
    this.view = this.service;
    this.isLoading = true;
    
    
    this.storageService.getRequiredItem(this.pageName.toLowerCase(),'TableDefinition').then((columnValues) =>  
    {
    this.columns = columnValues[0].Columns;
      this.PopulateChildDropDowns();
    this.service.queryForChild(this.parenttable.primarykeyduid,this.parentpageName.toLowerCase(),this.pageName.toLowerCase(), {
      skip: this.skip,
      take: 5
    });
    this.service.read(this.service.data );
    this.gridSettings =
    {
      tableName: this.pageName.toUpperCase(),
      state: {
        skip: 0,
        take: 1115,
        group: [
          {
          dir: 'desc',
          field: this.columns[1].field
         // aggregates :
          }],
        // Initial filter descriptor
      },
      columnsConfig:
        this.columns,
      gridData: process(this.service.data , {
        skip: 0,
        take: 1115,
        // Initial filter descriptor

      })
    };
     this.isLoading = false;
    });
    this.fileName = this.pageName + '.xlsx';
    this.validationmessage = "Invalid Column";
  }

  public GetDropDownValue(columnField: string, selectedValue: any): string {
    const filterValues =  this.columnFilterValues[columnField];
   const selectedRow =  this.service.data.filter(i=>i.primarykeyduid == selectedValue['primarykeyduid'])[0]
   if (filterValues && filterValues.length > 0) {
    const matchingValue = filterValues.find(item => item.Value === selectedRow[columnField]);
  return matchingValue ? matchingValue.Text : '';
   }
    
    return ''; // Return an empty string if no matching value is found
  } 
public onDropdownValueChange(value: any, field: string, event :any): void {
  this.service.data.filter(i=>i.primarykeyduid ==value['primarykeyduid'])[0][field] = event.Value
  this.masterDropdowValue1  = event;
  this.UpdateEditItemPushUpdateTable(value['primarykeyduid'],field,value,value[field].toString());
}
  private PopulateChildDropDowns() {
    //this code populated  the page dropdown
    this.storageService.getRequiredItem(this.tableName.toLowerCase(), 'Representation').then((items) => {
 
      let uitems = items[0].columns.filter(
        item => this.service.data.some(
          rep => rep.primarykeyduid === item.idx));
       // }

      if ( uitems.length > 0) {
        const mappedData = uitems.map(item => ({
          id: item.idx,
          name: item.representation,
        }));
        mappedData.unshift({ id: -1, name: '*' });
        this.dropdownData = mappedData;
      }
    });

    // this populates the dropdowns in the grid
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
        this.storageService.getRequiredItem(element.refTable.toLowerCase(), 'Representation').then((items) => {
          if (items.length > 0) {
            const mappedData = items[0].columns.map(item => ({
              Value: item.idx,
              Text: item.representation,
            }));
            if (items.length > 0) {
              if (this.columnFilterValues[element.field]) {
                this.columnFilterValues[element.field] = this.columnFilterValues[element.field].concat(mappedData);
              } else {
                this.columnFilterValues[element.field] = mappedData;
              }
            }
          }
        });
      }
      catch (error) {
        console.error(error);
      }
    }

    console.log(this.columnFilterValues);
  }


  public setSelectableSettings(): void {
    this.selectableSettings = {
      cell: true,
      mode: this.mode,
      drag: this.drag
    };
  }
// Use an arrow function to capture the 'this' execution context of the class.
public isRowSelected = (e: RowArgs) => this.selectedCellData.indexOf(e.dataItem) >= 0;

  
  public pageChange({ skip, take }: PageChangeEvent): void {
    this.skip = skip;
    this.service.queryForChild(this.parenttable.primarykeyduid,this.parentpageName,this.parentpageName.toLowerCase(), { skip, take });
  } 
  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;

    this.view.subscribe((data: any[]) => {
      data = orderBy(filterBy(data,this.filter), this.sort);
      this.view = of(data);
    });
  }

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
  private selectedCellData = [];
  private prevSelectedCellData = [];
  private firstSelectedCellData : string;
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.view.subscribe((data: any[]) => {
      data = orderBy(data, this.sort);
      this.view = of(data);
    });
  }

  public cellClickDetailsHandler(args: CellClickEvent): void {
    this.isFirstColumn = false;
    this.selectedColumnIndex = args.columnIndex;
    this.selectedRowIndex = args.rowIndex;
    if(args.columnIndex == 0)
  {
    this.isFirstColumn = true;
    this.rowData =  args.dataItem ;
  }
  else
  {
    let columnType=
    this.columns.filter((column)=>column.title.toLowerCase()===(args.column.title.toLowerCase()))[0]['type'];
    var columnComponent =
    this.columns.filter((column)=>column.title.toLowerCase().includes(args.column.title.toLowerCase()))[0] as ColumnComponent
   
    if(columnType == 'list')
    {
      return;
    }
    if(columnType == 'dropdown')
    {
      const filterValues =  this.columnFilterValues[columnComponent.field];
      const selectedRow =  this.service.data.filter(i=>i.primarykeyduid == args.dataItem['primarykeyduid'])[0]
      if (filterValues && filterValues.length > 0) {
       this.masterDropdowValue1 = filterValues.find(item => item.Value === args.dataItem[columnComponent.field]);
    }
   }
    if(columnType === 'number')
    {
       this.gridContextMenuItems = [
      { label: "What's this", disabled: false },
      { label: "Cut", disabled: false },
      { label: "Copy", disabled: false },
      { label: "Paste", disabled: false },
      { label: "Auto Complete(copy first cell)",  disabled: false },
      { label: "Auto Complete(data series)", disabled: false },
      { label: "Free Number Search", disabled: false },
      { label: "Call Up Record", disabled: false },
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
      { label: "Call Up Record", disabled: false },
    ];
  }
    if (!args.isEdited) {
      args.sender.editCell(args.rowIndex, args.columnIndex, this.generalTemplateHelper.createFormGroup(args.dataItem,this.columns));

    }
  }

  public cellCloseDetailsHandler(args: CellCloseEvent): void {
    const { formGroup, dataItem } = args;

    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      if (args.originalEvent && args.originalEvent.keyCode === Keys.Escape) {
        return;
      }
      if (!this.editedItems[formGroup.value.primarykeyduid]) {
        this.editedItems[formGroup.value.primarykeyduid] = [];
    }
      for (let key in formGroup.controls) {
        var primarykey:number = formGroup.get('primarykeyduid').value;
        if (formGroup.get(key).dirty || primarykey<0) {
              if(primarykey<0 && (formGroup.get(key).value===null ||(formGroup.get(key).value!==null && formGroup.get(key).value==="")))
                continue;
              if(this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]["isreadonly"]===true)
                continue;
              if(this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]["type"]==="list")
                continue;
            if (this.editedItems[formGroup.value.primarykeyduid].indexOf(key) === -1) {
                this.editedItems[formGroup.value.primarykeyduid].push(key);
            }
            var reqdAttribute = this.columns.filter((column)=>column.field.toLowerCase() ===key)[0]['attribute'];
            this.generalTemplateHelper.PushUpdateTable(primarykey,
              formGroup.get(key).value, reqdAttribute,this.tableName, this.updatetable) ;
        }
    }
      this.service.assignValues(dataItem, formGroup.value);
      this.service.update(dataItem);
    }
}

public visibleColumns: any ;

public kendoSelection: CellSelectionItem[] = [];
  public selectionChangeHandler(args: SelectionEvent): void {
    this.selectedCellData = [];
    const gridData = this.gridDetail.data as GridDataResult;
    const dataArray = gridData;
    this.visibleColumns =  this.columns.filter(h=>h.hidden == false);

    let previousRowIndex = -1;
    let isFirtCell : boolean = true;
    this.kendoSelection = this.kendoSelection.sort(this.generalTemplateHelper.CompareItems);
    for (const row of this.kendoSelection) {
      row.columnKey = row.columnKey+2;
      if(row.itemKey < 0)
      continue;
      const columnComponent = this.gridDetail.columns.toArray()[row.columnKey] as ColumnComponent;
      const field = columnComponent.field;
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
        this.firstSelectedCellData = dataArray[row.itemKey][columnComponent.field]
      }
      this.selectedCellData.push(dataArray[row.itemKey][columnComponent.field]);
      previousRowIndex = row.itemKey;
    }
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
    if(($event.ctrlKey || $event.metaKey) && $event.keyCode == 86)
      this.PasteFromClipboard(this.prevSelectedCellData);

}
public onDetailSelect({ dataItem, item }): void {
  const gridData = this.gridDetail.data as GridDataResult;

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
        this.PasteFromClipboardData(this.gridDetail);
        break;
      case "Delete":
        this.DeleteRows();
        break;
    }
  }

  switch (item.label) {
    //column header
    case "Toggle Filter Row":
      if(this.filterable === 'menu')
        this.filterable = 'menu, row';
      else
        this.filterable = 'menu'
     // this.LoadGridData();
      break;
    case "Clear Filters":
      this.filter ={
        logic: 'or',
        filters: []
      };
      //this.LoadGridData();
      break;
    case "Clear Sort Order":
      this.gridSettings.state.sort = [];
      break;
    //table
    case "Export to Excel":
      this.exportToExcel();
      break;
      case "Add New":
        this.AddNew(this.gridDetail);
        break;
    case "Auto Fit Columns":
      this.PasteFromClipboard(this.selectedCellData);
      break;
    case "Unfreeze Columns":
      this.PasteFromClipboard(this.selectedCellData);
      break;
  }
  this.gridFunction.BuildContextMenuItems();
  this.service.hasChanges();  
}
private CopyRows(): void {
  var copyData = JSON.stringify(this.rowData);
    this.clipboard.copy(copyData);
}
private DeleteRows(): void {
  this.service.remove(this.rowData);
}
private CutSelectedData() {
this.selectedCellData = [];
const gridData = this.gridDetail.data as GridDataResult;
this.kendoSelection = this.kendoSelection.sort(this.generalTemplateHelper.CompareItems);
for (const row of this.kendoSelection) {
  const columnComponent = this.gridDetail.columns.toArray()[row.columnKey] as ColumnComponent;
  const field = columnComponent.field;
  gridData[row.itemKey][columnComponent.field] = '';
}
}

private AutoCompleteCopyFirstCell(){
const gridData = this.gridDetail.data as GridDataResult;

for (const row of this.kendoSelection) {
  const columnComponent = this.gridDetail.columns.toArray()[row.columnKey] as ColumnComponent;
  const existingDataItem =   gridData[row.itemKey];
  const field = this.visibleColumns[row.columnKey-1];// columnComponent.field;
  gridData[row.itemKey][columnComponent.field] = this.firstSelectedCellData;
  const currentRow = gridData[row.itemKey];
  const primarykeyduid = currentRow['primarykeyduid'];
  this.UpdateEditItemPushUpdateTable(primarykeyduid,columnComponent.field,currentRow,this.firstSelectedCellData)
}

}

private UpdateEditItemPushUpdateTable(primarykeyduid : number,field :string,currentRow :any,value : string ){
    if (!this.editedItems[primarykeyduid])  
        this.editedItems[primarykeyduid] = [];

        if (this.editedItems[primarykeyduid].indexOf(field) === -1)  
          this.editedItems[primarykeyduid].push(field);                

    this.service.assignValues(currentRow,currentRow);
    this.service.update(currentRow);

    var reqdAttribute = this.columns.filter((column)=>column.field.toLowerCase() ===field)[0]['attribute'];
    this.generalTemplateHelper.PushUpdateTable(primarykeyduid,
      value, reqdAttribute,this.tableName, this.updatetable) ;
}
private CallUpRecord(columnValIndex:number){
  const gridData = this.gridDetail.data as GridDataResult;
  for (const row of this.kendoSelection) {
    const columnComponent = this.gridDetail.columns.toArray()[row.columnKey] as ColumnComponent;
    const title = columnComponent.title;
    let columnRefValue=  this.columns.filter((column)=>column.refTable!=null && column.title==title )[0];
    this.menubarComponent.openNewWindow("links",this.bvNumber);
  }
  
  }
private AutoCompleteSeries(){
const gridData = this.gridDetail.data as GridDataResult;
let kendoSelectionColumnWise: CellSelectionItem[] = [];
kendoSelectionColumnWise = this.kendoSelection.sort(this.generalTemplateHelper.CompareItemsColumnWise);

let prevColumnIndex : number = -1;
let firstCellRow : number;
let isFirstCell : boolean = true;
for (const row of kendoSelectionColumnWise) {

  const columnComponent = this.gridDetail.columns.toArray()[row.columnKey] as ColumnComponent;
  if(prevColumnIndex != row.columnKey){
    firstCellRow = Number(gridData[row.itemKey][columnComponent.field]);
  }
  else
  firstCellRow = firstCellRow + 1;

  prevColumnIndex = row.columnKey;
  gridData[row.itemKey][columnComponent.field] = firstCellRow;
  const currentRow = gridData[row.itemKey];
  const primarykeyduid = currentRow['primarykeyduid'];
  this.UpdateEditItemPushUpdateTable(primarykeyduid,columnComponent.field,currentRow,firstCellRow.toString());
}
}

PasteFromClipboard(selectedCellData: any) {
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

const gridData = this.gridDetail.data as GridDataResult;
this.kendoSelection = this.kendoSelection.sort(this.generalTemplateHelper.CompareItems);
let itemKey : number = this.kendoSelection[0].itemKey;
let columnKey : number = this.kendoSelection[0].columnKey;
for (const row of rows) {
    columnKey = this.kendoSelection[0].columnKey;
  for (const column of row)
  {
    const columnComponent = this.gridDetail.columns.toArray()[columnKey] as ColumnComponent;
    gridData[itemKey][columnComponent.field] = column;
    columnKey = columnKey + 1;
  }
  itemKey = itemKey + 1;
}
}
AddNew(grid)
{
  this.addNewRowData(grid,false);
}
PasteFromClipboardData(grid) {
this.addNewRowData(grid,true);
}
addNewRowData(grid,bclone:boolean) {
  let counter : number = 0;
  let result: any;
  if(bclone)
    result = this.generalTemplateHelper.createNewFormGroup(this.rowData,this.service.data,this.columns,this.parenttable.primarykeyduid);
  else
    result = this.generalTemplateHelper.createNewFormGroup(null,this.service.data,this.columns,this.parenttable.primarykeyduid);
  this.service.save(result.value,true);
  grid.editRow(counter, result);
  counter= counter+1;
  
  this.view = this.service;
  this.GetGridItem();  
}
  // public createNewFormGroup(dataItem:any, dataPoints:any[], column): FormGroup {
  //   var controlGrp = this.formBuilder.group({});
  //   const minDataItem = dataPoints.reduce((prev, current) => (prev.primarykeyduid < current.primarykeyduid) ? prev : current);
  // var minPrimarykeyduid:number = -1;
  // if(minDataItem!=undefined && minDataItem!=null)
  // { 
  //   minPrimarykeyduid = minDataItem.primarykeyduid as number;
  // }
  // if(minPrimarykeyduid>0)
  // {
  //   minPrimarykeyduid=0;
  // }
  //   this.columns.forEach(p=>{
  //     //if(!p.isreadonly)
  //     {
  //       if(p.field==="primarykeyduid")
  //         controlGrp.addControl(p.field,new FormControl(minPrimarykeyduid-1));
  //       else
  //         controlGrp.addControl(p.field,new FormControl(dataItem[p.field]));
  //     }
  //     });
  //     return controlGrp;
  // }
  public GetGridItem()
  {
    this.storageService.getRequiredItem(this.pageName,'TableSettings').then((items) => {

      if (items[0]!= null && items[0] !=undefined) {
        if(items[0].state.sort != undefined)
        {
          this.gridSettings.state.sort = JSON.parse(JSON.stringify(items[0].state.sort)) ;
        }
        
        if(items[0].columnsConfig != undefined)
        {
          this.gridSettings.columnsConfig = JSON.parse(JSON.stringify(items[0].columnsConfig)) ;
          this.columns= this.gridSettings.columnsConfig ;
        }
        this.savedGridSettings = JSON.parse(JSON.stringify(this.gridSettings));

      }
    });
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
public cancelChanges(): void {
  this.service.isNewRow = false;

  this.gridDetail.closeRow(-1) ;

  this.service.cancelChanges();
  // reset the dirty items
  this.editedItems = {};
  this.updatetable=[];
}
onHeaderClick(columnIndex: number,columntitle: string ) {
  this.isFirstColumn = false;
  //clickEvent.preventDefault();
    this.selectedColumnIndex = columnIndex;
    let columnType=
    this.columns.filter((column)=>column.title.toLowerCase()===(columntitle.toLowerCase()))[0]['type'];
    if(columnType === 'number')
    {
       this.gridContextMenuItems = [
      { label: "What's this", disabled: false },
      { label: "Cut", disabled: false },
      { label: "Copy", disabled: false },
      { label: "Paste", disabled: false },
      { label: "Auto Complete(copy first cell)",  disabled: false },
      { label: "Auto Complete(data series)", disabled: false },
      { label: "Free Number Search", disabled: false },
      { label: "Free Number Search", disabled: false },
      { label: "Call Up Record", disabled: false },
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
    { label: "Call Up Record", disabled: false },
  ];
  //this.childContextMenuDetail.show = true; 
  }
// Function to export grid data to Excel
public exportToExcel() {
  this.gridDetail.saveAsExcel();
}

public colorCode(dataitem:any,code: string): SafeStyle {  
  this.service.hasChanges();
  let result = this.generalTemplateHelper.colorCode(dataitem,code,this.editedItems);
  return this.sanitizer.bypassSecurityTrustStyle(result);
}
  public fontColor(code: string): SafeStyle {
    let result = this.generalTemplateHelper.fontColor(code);
    return this.sanitizer.bypassSecurityTrustStyle(result);
}

public saveChanges(): void {
  this.gridDetail.closeCell();
  this.gridDetail.cancelCell();
  this.gridDetail.closeRow(0) ;
  this.service.AddDeletedItems(this.tableName,this.updatetable);
  this.service.saveChanges();
}
public hasChanges():boolean
{
  return this.service.hasChanges();
}
}
