import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { BehaviorSubject, Observable, zip } from 'rxjs';

import { map } from 'rxjs/operators';
import { PrimaryKeyValues, UpdateTable } from '../model/model';
import { GeneralTemplateComponent } from '../general-template/general-template.component';
import { DetailComponent } from '../../nestedgrid/childgrid/child.component';
import { NotificationService } from "@progress/kendo-angular-notification";
import { UserNotificationService } from 'src/app/shared/usernotification/usernotification.service';

const CREATE_ACTION = 'create'
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
export class EditService extends BehaviorSubject<unknown[]> {
    public data: any[] = [];
    private originalData: any[] = [];
    private createdItems: any[] = [];
    private updatedItems: any[] = [];
    private deletedItems: any[] = [];
    public isNewRow : boolean = false;
    public isChildChange : boolean = false;
    public updatetable: UpdateTable[]=[];
    public editedItems: any = {};
    public generalTemplateComponent: GeneralTemplateComponent;
    public detailComponent: DetailComponent;
    public bvNumber:number;
    constructor(private http: HttpClient,private userNotificationService: UserNotificationService) {
        super([]);
    }
    public hideAfter = 2000;

    public read(dataParent: any[]): void 
    {        
        this.data = dataParent;
                this.originalData = cloneData(dataParent);
                super.next(dataParent);
        this.generalTemplateComponent.data = this.data;        
    }
     
    public create(item: any): void {
        const completed = [];
        
         this.data.splice(0, 0, item);
         const index = item.primarykeyduid;
             this.createdItems.splice(index, 1, item);
            if (this.createdItems.length) {
                completed.push(this.fetch(CREATE_ACTION, this.createdItems));
                this.data = super.value;
        zip(...completed).subscribe(() => this.read(this.data));
    }
}

      public save(data: any, isNew?: boolean): void {
        const completed = [];
        if (isNew) {
            this.data.splice(0, 0, data);
            const index = this.createdItems.indexOf(data);
            this.createdItems.splice(index, 1, data);
            if (this.createdItems.length) {
                completed.push(this.fetch(CREATE_ACTION, this.createdItems));
                this.data = super.value;
        zip(...completed).subscribe(() => this.read(this.data));
            }
          } 
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

        super.next(this.data);
    }

    public isNew(item: any): boolean {
        return item.primarykeyduid<0;
    }

    public hasChanges(): boolean {
        return Boolean( this.deletedItems.length || this.updatedItems.length || this.createdItems.length || this.isChildChange);
    }
    public hasCancelChanges(): boolean {
        return Boolean( this.isNewRow || this.deletedItems.length || this.updatedItems.length || this.createdItems.length || this.isChildChange);
    }
    public hasChildChanges(): boolean {
        return this.isChildChange;
    }

    public saveChanges(url:string,bvnumber:number, pagename:string): void {
        this.generalTemplateComponent.loading=true;
        if (!this.hasChanges()) {
            return ;
        }

        const completed = [];
        if (this.deletedItems.length) {
            completed.push(this.fetch(REMOVE_ACTION, this.deletedItems));            
        }

        if (this.updatedItems.length) {
            completed.push(this.fetch(UPDATE_ACTION, this.updatedItems));
        }

        if (this.createdItems.length) {
            completed.push(this.fetch(CREATE_ACTION, this.createdItems));
        }

        const httpOptions = {
            headers: new HttpHeaders({
              'Content-Type': 'application/json', // Set the Content-Type header to JSON
            }),
          };
          
        //pagename = 'links';
        var jsonValue= JSON.stringify(this.updatetable);
        
        this.http.post(url + '/' + pagename + '/' + bvnumber, this.updatetable, httpOptions)
        .subscribe(
            (response: any) => {
                // Check the status code before processing the response
                if (response && response.status === undefined) {
                    // Handle the success response here
                    this.userNotificationService.showSuccess("Record saved in the database");
                    var returnValue = response as PrimaryKeyValues[]; // Use 'body' to get the response body
                    console.log('Before reset');
                    this.reset();
                    console.log('After reset');
                    this.generalTemplateComponent.reload(true);
                    console.log('After reload');
                    this.data = super.value;
                    zip(...completed).subscribe(() => this.read(this.data));
                } else {
                    this.reset();
                    this.generalTemplateComponent.reload(true);
                    this.generalTemplateComponent.loading=false;
                    // Handle unexpected response
                    console.error('Unexpected response:', response);
                    this.userNotificationService.showError("Unexpected response from the server");
                }
            },
            (error) => {
                this.reset();
                this.generalTemplateComponent.loading=false;
                this.generalTemplateComponent.reload(true);
                this.userNotificationService.showError("Error occurred, data not saved");
            }
        );
    
      
    }

    public AddDeletedItems(tablename:string): void
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
                
              let indexTableToUpdate  = this.updatetable.findIndex(item =>item.tablename === newupdatetable.tablename && item.modetype===3 );    
              if(indexTableToUpdate>-1)
              {
                let existingAttribute  = this.updatetable[indexTableToUpdate].attributelist.find(item =>item.keyid === updatedValueList.keyid  ); 
                if(existingAttribute!=undefined)
                {
                    existingAttribute.keyvalue=existingAttribute.keyvalue+','+updatedValueList.keyvalue;
                }
                else
                {
                    this.updatetable[indexTableToUpdate].attributelist.push(updatedValueList);
                }
              }
              else
              {
                this.updatetable.push( newupdatetable);
              }
            }
        }
    }
    public cancelChanges(): void {
        this.reset();

        this.data = this.originalData;
        this.originalData = cloneData(this.originalData);
        super.next(this.data);
        this.generalTemplateComponent.data = this.data;  
    }

    public assignValues(target: unknown, source: unknown): void {
        Object.assign(target, source);
    }

    public reset() {
        this.data = [];
        this.deletedItems = [];
        this.updatedItems = [];
        this.createdItems = [];
        this.editedItems = {}; // reset the dirty items 
        this.updatetable = [];
        this.isNewRow = false;        
    }

    private fetch(action = '', data?: any[]): Observable<any[]> {
        return this.http
            .jsonp(`https://demos.telerik.com/kendo-ui/service/Linkss/${action}?${this.serializeModels(data)}`, 'callback')
            .pipe(map(res => <any[]>res));
    }

    private serializeModels(data?: any[]): string {
        return data ? `&models=${JSON.stringify(data)}` : '';
    }

    private reloadvalues(returnprimaryKeys:PrimaryKeyValues[])
    {
        this.generalTemplateComponent.reloadvalues(returnprimaryKeys);
    }
}
