import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { State, toODataString } from '@progress/kendo-data-query';
import { Observable, BehaviorSubject, zip, of,from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AppConfig } from 'src/app/AppConfig.service';
import { Stop, UpdateTable } from '../general-template/model/model';
import { underlineIcon } from '@progress/kendo-svg-icons';
import { DataService } from 'src/app/data.service';
import { EditService } from '../general-template/services/edit.service';


const CREATE_ACTION = 'create';
const UPDATE_ACTION = 'update';
const REMOVE_ACTION = 'destroy';

const itemIndex = (item: any, data: any[]): number => {
    for (let idx = 0; idx < data.length; idx++) {
        if (data[idx].primarykeyduid === item.primarykeyduid) {
            return idx;
        }
    }

    return -1;
};

const cloneData = (data: any[]) => data.map(item => Object.assign({}, item));

@Injectable()
export abstract class MasterDetailsService extends BehaviorSubject<unknown[]> {
    public loading: boolean;
    public data: any[] = [];
    private originalData: any[] = [];
    private createdItems: any[] = [];
    private updatedItems: any[] = [];
    private deletedItems: any[] = [];
    public isNewRow : boolean = false;
    public bvNumber:number;
    private BASE_URL = "";
    constructor(
        private http: HttpClient, private dataService: DataService, private editService: EditService,
        protected tableName: string
    ) {
        super([]);

        this.BASE_URL = AppConfig.settings.apiUrl; 

    }
 
    public query(parentpagename:string,childpagename:string, state: State, parentTableIndex:number): void {
        this.tableName = this.tableName+childpagename + AppConfig.settings.templateExtension;
        this.fetch(childpagename,this.tableName, state,parentTableIndex)
            .subscribe(x => super.next(x));
    }

    public fetch(childpagename:string, queryname: string, state: State, parentTableIndex:number): Observable<any[]> {
        const queryStr = `${toODataString(state)}&$count=true`;
        this.loading = true;
        let field  = 'field' 
        let value = 'value'
        this.dataService.bvNumber=this.bvNumber;
        if(AppConfig.settings.templateExtension=='')
        {
            queryname = queryname+'/'+this.bvNumber;
            if (state.filter) {
                const filters = state.filter;
                if (filters) {
                    if(filters.filters.length>1) 
                    {
                        let filter1 = filters.filters[0];
                        queryname = queryname+'/'+filter1[value];
                    }
                }
            }
            queryname = queryname+'/'+parentTableIndex;
        }
        return from( this.dataService.fetchDataFromApi(`${childpagename}`, `${queryname}`,true)
        .then((initialData: any[]) => {
          // Apply filtering based on state.filter
          let filteredData = initialData;
        //   if (state.filter) {
        //     const filters = state.filter; // Assuming only one filter is applied
        //     if (filters) {
        //         var operator = 'eq'; // Access operator directly

        //         // Implement your filtering logic here
        //         switch (operator) {
        //           case 'eq': 
        //             for (let i = 0; i < filters.filters.length; i++) {
        //                  let filter1 = filters.filters[i];
        //               filteredData = filteredData.filter(item => item[filter1[field] ] ===filter1[value]);
        //             }
        //             break;
        //           case 'neq':
        //             for (let i = 0; i < filters.filters.length; i++) {
        //                 let filter1 = filters.filters[i];
        //                 filteredData = filteredData.filter(item => item[filter1[field] ] !=filter1[value]);
        //            }
        //             break;
        //           // Add more cases for other operators as needed
        //           default:
        //             break;
        //         }
        //     }
        //   }
          filteredData = filteredData.filter(item => item["parenttableindex" ] ===parentTableIndex);
          const gridData = <GridDataResult>{
            data: filteredData,
            total: filteredData.length
          };
          this.data = gridData.data;
          this.originalData = cloneData(gridData.data);
          this.loading = false;
          return gridData.data;
        }) 
        );
      
      }     
    
      public refreshaftersave(): void {
        this.originalData = cloneData(this.data);
                super.next(this.data);
    }
    public read(dataParent: any[]): void {
        this.data = dataParent;
                this.originalData = cloneData(dataParent);
                super.next(dataParent);
    }

    public create(item: any): void {
        const completed = [];
     //   this.createdItems.push(item);
        this.data.splice(0, 0, item);
            const index = this.createdItems.indexOf(item);
            this.createdItems.splice(index, 1, item);
            if (this.createdItems.length) {
                completed.push(this.fetchData(CREATE_ACTION, this.createdItems));
                this.data = super.value;
        zip(...completed).subscribe(() => this.read(this.data));
    }
    this.hasChanges();
}

      public save(data: any, isNew?: boolean): void {
        const completed = [];
        if (isNew) {
            this.data.splice(0, 0, data);
            const index = this.createdItems.indexOf(data);
            this.createdItems.splice(index, 1, data);
            if (this.createdItems.length) {
                completed.push(this.fetchData(CREATE_ACTION, this.createdItems));
                this.data = super.value;
        zip(...completed).subscribe(() => this.read(this.data));
            }
          } 
          this.hasChanges();
    }
    public update(item: any): void {
        if (!this.isNew(item)) {
            const index = itemIndex(item, this.updatedItems);
            if (index !== -1) {
                this.updatedItems.splice(index, 1, item);
            } else {
                this.updatedItems.push(item);
            }
        } else {
            const index = this.createdItems.indexOf(item);
            this.createdItems.splice(index, 1, item);
        }
        this.hasChanges();
    }

    public remove(item: any): void {
        let index = itemIndex(item, this.data);
        this.data.splice(index, 1);

        index = itemIndex(item, this.createdItems);
        if (index >= 0) {
            this.createdItems.splice(index, 1);
        } else {
            this.deletedItems.push(item);
        }

        index = itemIndex(item, this.updatedItems);
        if (index >= 0) {
            this.updatedItems.splice(index, 1);
        }
        this.hasChanges();
        super.next(this.data);
    }

    public isNew(item: any): boolean {
        return !item.primarykeyduid;
    }

    public hasChanges(): boolean {
        this.editService.isChildChange = Boolean(this.isNewRow || this.deletedItems.length || this.updatedItems.length || this.createdItems.length);
        return Boolean(this.isNewRow || this.deletedItems.length || this.updatedItems.length || this.createdItems.length);
    }

    public saveChanges(): void {
        if (!this.hasChanges()) {
            return;
        }

        const completed = [];
        if (this.deletedItems.length) {
            completed.push(this.fetchData(REMOVE_ACTION, this.deletedItems));
        }

        if (this.updatedItems.length) {
            completed.push(this.fetchData(UPDATE_ACTION, this.updatedItems));
        }

        if (this.createdItems.length) {
            completed.push(this.fetchData(CREATE_ACTION, this.createdItems));
        }        
        zip(...completed).subscribe(() => this.read(this.data));
    }
    public AfterSaveSuccess()
    {
        this.reset();
        this.data = super.value;        
    }
    public AddDeletedItems(tablename:string,updatetable: UpdateTable[]): UpdateTable[]
    {
        if (this.deletedItems.length) {
            for(var deletedItem of this.deletedItems)
            {
                var updatedValueList ={
                primarykey : deletedItem.primarykeyduid,
                keyid: 'idx',
                keyvalue: deletedItem.primarykeyduid as string+''
              };
              var newupdatetable = new UpdateTable();
                newupdatetable.tablename=tablename;
                
                newupdatetable.parenttablename = "";
                newupdatetable.modetype=3;
                newupdatetable.attributelist= [];
                newupdatetable.attributelist.push(updatedValueList);
                
              let indexTableToUpdate  = updatetable.findIndex(item =>item.tablename === newupdatetable.tablename && item.modetype===3 );    
              if(indexTableToUpdate>-1)
              {
                let existingAttribute  = updatetable[indexTableToUpdate].attributelist.find(item =>item.keyid === updatedValueList.keyid  ); 
                if(existingAttribute!=undefined)
                {
                    existingAttribute.keyvalue=existingAttribute.keyvalue+','+updatedValueList.keyvalue;
                }
                else
                {
                  updatetable[indexTableToUpdate].attributelist.push(updatedValueList);
                }
              }
              else
              {
                updatetable.push( newupdatetable);
              }
            }
        }
        return updatetable;
    }
    public cancelChanges(): void {
        this.reset();

        this.data = this.originalData;
        this.originalData = cloneData(this.originalData);
        super.next(this.data);
    }

    public assignValues(target: unknown, source: unknown): void {
        Object.assign(target, source);
    }

    public reset() {
        this.data = [];
        this.deletedItems = [];
        this.updatedItems = [];
        this.createdItems = [];
        this.isNewRow = false;
    }

    private fetchData(action = '', data?: any[]): Observable<any[]> {
        return this.http
            .jsonp(`https://demos.telerik.com/kendo-ui/service/Linkss/${action}?${this.serializeModels(data)}`, 'callback')
            .pipe(map(res => <any[]>res));
    }

    private serializeModels(data?: any[]): string {
        return data ? `&models=${JSON.stringify(data)}` : '';
    }
}

@Injectable()
export class DetailsService  extends MasterDetailsService {
    constructor(http: HttpClient,  dataService: DataService, editService:EditService) { 
        super(http,dataService,editService, AppConfig.settings.apiUrl+'/'); 
   // this.fetchInitData('stops',AppConfig.settings.apiUrl+'/stoppingpoints');

}
 
    public queryForChild(primaryKeyIndex: any,parentpagename:string,childpagename:string, state?: State): void {
        this.query(parentpagename,childpagename,state,primaryKeyIndex);
    }

}

@Injectable()
export class MasterService extends MasterDetailsService {
    constructor(http: HttpClient,dataService:DataService, editService:EditService) { 
        super(http,dataService,editService, AppConfig.settings.apiUrl+'/'); }

    queryAll(st?: State): Observable<any[]> {
        const state = Object.assign({}, st);
        delete state.skip;
        delete state.take;

        return this.fetch('stops',this.tableName, state,1);
    }
}
