import { Component, ElementRef, OnInit, ViewChild ,ChangeDetectorRef} from '@angular/core';
//import { GeneralTemplateComponent } from 'src/app/features/general-template/general-template/general-template.component';
import { DataType, GeneralTemplateService } from 'src/app/features/general-template/services/general-template.service';
//import { PopupService } from '@progress/kendo-angular-popup';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WindowState } from '@progress/kendo-angular-dialog';
import { MasterService } from 'src/app/features/nestedgrid/nestedservice';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { AttributeInfo, FetchData, Stop, UpdateTable } from 'src/app/features/general-template/model/model';
import { State } from '@progress/kendo-data-query';
import { AppConfig } from 'src/app/AppConfig.service';
import { SharedService } from 'src/app/shared/shared.service';
import { StorageService } from 'src/app/storage/storageservice';
import { DataService } from 'src/app/data.service';
import { Parameters, RootObject } from 'src/app/features/general-template/model/model';
import { IMapQueryParams } from 'src/app/map/interfaces/map-query-params.interface';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  providers: [MasterService],
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss']
})
export class MenubarComponent  implements OnInit {
  @ViewChild('windowWrapper') public winWrapper: ElementRef;
  windows: { title: string, isLoading: boolean ,data: any[], columns: any[], isDropdownVisible:boolean, 
    parameterName:string, childpageName: string, tableName: string, childTableName: string,
    bvNumber:number, windowParameters :any ,tableType : string,columnFilterValues: { [key: string]: any[] },
    keysArray: string[],mapdisplay?:boolean,}[] = []; //data = this.generalTemplateService.dataSubject.pipe(map(this.openWindows));
  gridData: any[];
  gridColumns: any[];
  isDropdownVisible: boolean = false;
  parameterName: string;
  windowTop: number;
  windowLeft: number;
  windowWidth: number;
  windowHeight: number;
  windowState: WindowState = 'maximized';
  pageName : string;
  menuItem : string;
  bvNumber:number;
  tableType : string;
  public loading: boolean;
  public isTableEditor: boolean=true;
  columnFilterValues: { [key: string]: any[] } = {};
  keysArray: string[];
  windowParameters : any
  constructor(private router: Router, private generalTemplateService: GeneralTemplateService,
    private http: HttpClient,private service: MasterService,public storageService: StorageService,private cdr: ChangeDetectorRef,
    private dataService: DataService) 
    {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const id = urlParams.get('bvNumber');
      this.bvNumber = parseInt(id);
    }
  public ngOnInit(): void {
    Utils.closeExistingWindow();
    this.generalTemplateService.getEventEmitter().subscribe((data: any) => {
      this.openNewWindow(data.message,this.bvNumber);
    });
    this.loading = false;
    this.dataService.bvNumber=this.bvNumber;
    //this.storageService.removeItem('TableValue','0');    
    var url = AppConfig.settings.apiUrl+'/stops' + AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')
      url = url +'/'+this.bvNumber;
    this.dataService.fetchDataFromApi('stops', url,false).then(async (data) => { })
    url = AppConfig.settings.apiUrl+'/stoppoints' + AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')
      url = url +'/'+this.bvNumber;    
    this.dataService.fetchDataFromApi('stoppoints', url,true).then(async (data) => { })
  }
  public dropDownData : any[];
  private columnsFetched: any[];
  public left = 0;
  public top = 0;
  public width = 300;
  public height = 350;
  public opened = true;
  public wrapper: DOMRect;
  ngAfterViewInit(): void
{
    try {
      this.wrapper = this.winWrapper.nativeElement.getBoundingClientRect();
    }
    catch (error) {
      console.error(error);
    }
}
  public restrictMovement() {
    this.cdr.detectChanges();

    const minTop = this.wrapper.top - 85 ;
    const minLeft = this.wrapper.left - 20;
    const maxTop = this.wrapper.top + this.wrapper.height - 45 ;
    const maxLeft = this.wrapper.left + this.wrapper.width ;

    if (this.top < minTop) {
        this.top = minTop ;
    }

    if (this.left < minLeft) {
        this.left = minLeft;
    }

    if (this.top > maxTop) {
        this.top = maxTop;
     }

    if (this.left > window.innerWidth/4) {
        this.left = window.innerWidth/4;
    }
}

  openNewWindow(menuItem: string, bvNumber: number)  {
    this.tableType = "simple";
    this.loading = true;

    if(menuItem != undefined)
    {
      if(menuItem==='geoeditor')
      {        
        this.loading = false;
        const queryParams: IMapQueryParams = { bvNumber:this.bvNumber };
        Utils.openInNewWindow(['geoeditor'], queryParams, true, screen.availWidth, screen.availHeight);
        return;
      }
      else 
        this.isTableEditor=true;
    var dataFileName: string = 'assets/mocks/'+menuItem+'.json';
      const columnSettingFileName: string = 'assets/mocks/'+menuItem+'-columns.json';
      
      this.pageName = menuItem.toUpperCase();
      this.menuItem= menuItem;
      const apiUrl = AppConfig.settings.apiUrl;
      dataFileName = apiUrl+"/"+menuItem.toLowerCase() + AppConfig.settings.templateExtension;
      if(AppConfig.settings.templateExtension=='')
        dataFileName = dataFileName +'/'+this.bvNumber;
      this.isDropdownVisible=false; 
      
     let fetchTable: FetchData[]=[];

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json', // Set the Content-Type header to JSON
        }),
      };
      this.storageService.getRequiredItem(this.pageName.toLowerCase(), 'TableDefinition').then((columns) => {
        var tableName = columns[0].TableName;
        this.windowParameters= columns[0].Parameters;

        var childName = columns[0].ChildName;
        this.tableType = columns[0].TableType;
        this.columnsFetched = columns;
        var columnsValue = columns[0].Columns;
        var tableType = columns[0].TableType;
        var childTableName = columns[0].ChildTableName;
        var mapdisplay = columns[0].MapDisplay;
        
        if (tableType != undefined && tableType.toLowerCase() == 'simple') {
          var fetchData = new FetchData();
          fetchData.tablename = tableName;
          //var updatedValueList = c.map(item => item.attribute);

          var  updatedValueList = columnsValue.map(item => {
            const attributeInfo = new AttributeInfo();
            attributeInfo.attributename = item.attribute;
            attributeInfo.usageTable = item.usageTable || ''  ;
            attributeInfo.usageColumn = item.usageColumn || ''  ;
            attributeInfo.usageProvider = item.usageProvider || ''  ;
            return attributeInfo;
          });

          fetchData.attributelist = updatedValueList;

          fetchTable.push(fetchData);

          this.http.post(apiUrl + '/' + 'DataFetch' + '/' + this.bvNumber, fetchTable, httpOptions)
            .subscribe(
              (response: any) => {
                this.gridData = response;
                
                this.SetWindowData();
                this.loading = false;
              },
              (error) => {
                console.log('Unexpected response:', error);
                this.loading = false;

              }
            )
        }
        else {
          // Determine the visibility based on the current route or URL
          this.dataService.fetchDataFromApi(this.pageName.toLowerCase(), dataFileName,false).then( (data) => {     
          //this.http.get<any[]>(dataFileName,).subscribe(data => {
            var dateFilteredArray = columnsValue.filter(p=>p.type === "date");
            for (const element of dateFilteredArray)
            {
              data.map((item) => {
                if (element.type === "date") {
                    item[element.field] = new Date(item[element.field]);
                  }
                });
            }
            this.gridData = data;
            
            this.SetWindowData();     

          });
        }
      });
    }
    else
    {
      const dataFileName: string = 'assets/mocks/'+menuItem+'.json';
      const columnSettingFileName: string = 'assets/mocks/'+menuItem+'-columns.json';
      
      const pageName: string = menuItem.toUpperCase();;
      // Determine the visibility based on the current route or URL    
      this.http.get<any[]>(dataFileName).subscribe(data => 
      {
          this.gridData = data;
          this.http.get<any[]>(columnSettingFileName).subscribe(columns => 
            {
              this.gridColumns = columns; 
              if(menuItem.includes("stoppoint"))
              {
                this.parameterName = "Stop:";
                this.isDropdownVisible=true; 
                //this.dropdownData.de = "*";
              }
              else
              {
                this.isDropdownVisible=false;
              }
              const childName:string = "";
              const childTableName:string = "";
              const requiredItem = { title: pageName, data: this.gridData,isLoading : true , columns: this.gridColumns, 
                isDropdownVisible: this.isDropdownVisible, parameterName: this.parameterName, childpageName:childName, 
                tableName:"Gdm:Haltestelle",childTableName:childTableName,bvNumber:1, windowParameters : this.windowParameters,
                tableType : this.tableType,columnFilterValues:this.columnFilterValues,keysArray:this.keysArray,mapdisplay:false};
                
              
                const found = this.windows.find((obj) => {
                return obj.title === requiredItem.title;
              });
              if(found === undefined)
              {
                  this.windowTop=20;
                  this.windowLeft=0;
                  this.windows.push(requiredItem);
              }
              else{
                const index = this.windows.indexOf(found);
                
              }
            });
      });
    }
  }
 
  handleMaximize(window: any) {
    // Adjust the window size to fit within the browser window boundaries
    const browserWidth = window.innerWidth;
    const browserHeight = window.innerHeight;

    // You may need to adjust the values based on your layout and styling
    const maxWidth = browserWidth - 20; // Subtracting some padding
    const maxHeight = browserHeight - 20; // Subtracting some padding

    if (window.width > maxWidth) {
      window.width = maxWidth;
    }

    if (window.height > maxHeight) {
      window.height = maxHeight;
    }
  }

  getLoadingZIndex(): number {
    // You can adjust the base z-index value based on your needs
    const baseZIndex = 1000;
    
    // Assuming windows is an array of open windows
    const maxWindowZIndex =1;// this.windows.reduce((maxZIndex, window) => Math.max(maxZIndex, window.zIndex || 0), 0);
  
    // Set a higher z-index for the loading container
    return maxWindowZIndex + baseZIndex + 1;
  }
private SetWindowData()
{  
this.gridColumns = this.columnsFetched[0].Columns; 
    var tableName = this.columnsFetched[0].TableName;
    var childName = this.columnsFetched[0].ChildName;
    var childTableName = this.columnsFetched[0].ChildTableName;
    var parameters = this.columnsFetched[0].Parameters;
    var mapDisplay = this.columnsFetched[0].MapDisplay;
  
     
    if(parameters !=undefined && parameters.length >0)
    {
      this.isDropdownVisible=true;
    }
    
    this.loading = false;
    //this.storageService.removeItem('TableValue',childName.toLowerCase());
    const requiredItem = { title: this.pageName, data: this.gridData,isLoading : true , columns: this.gridColumns, 
      isDropdownVisible: this.isDropdownVisible, parameterName: this.parameterName, childpageName:childName, 
      tableName:tableName,childTableName:childTableName,bvNumber :this.bvNumber,windowParameters :this.windowParameters,
      tableType : this.tableType,zIndex: 1,columnFilterValues:this.columnFilterValues,keysArray:this.keysArray,mapdisplay:mapDisplay};
    
      const found = this.windows.find((obj) => {
      return obj.title === requiredItem.title;
    });
    if(found === undefined)
    {
        this.windowTop=20;
        this.windowLeft=0;
        this.windows.push(requiredItem);
    }   
  if(childName.length>0 && (childName.toLowerCase()==='stoppoints'))
  {
    var url : string = AppConfig.settings.apiUrl+'/'+ childName.toLowerCase()+ AppConfig.settings.templateExtension;
    if(AppConfig.settings.templateExtension=='')
      url = url +'/'+this.bvNumber;
    this.dataService.fetchDataFromApi(childName.toLowerCase(), url,true).then(async (data) => {      
    });
  }    
}
  closeWindow(window: any) {
    //this.storageService.removeItem('TableValue',window.childpageName.toLowerCase());
    this.loading = false;   
    const index = this.windows.indexOf(window);
    if (index > -1) {
      this.windows.splice(index, 1);
    }
  }

   maximizeWindow() {
    const parentHeight = window.innerHeight;

    const navBarHeight = 50; // Adjust this value to match your navigation bar's height
    this.windowHeight = parentHeight-65;
    this.windowWidth = window.innerWidth -42;
    this.windowTop = 65;
    this.windowLeft =10;
  } 
}
