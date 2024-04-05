import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Links, UpdateTable } from '../model/model';
import { Stop } from '../model/model';
import { CellSelectionItem } from '@progress/kendo-angular-grid';
import { EditService } from '../services/edit.service';

export default class GeneralTemplateHelper {

    constructor(private formBuilder: FormBuilder) {

    }
    static doSomething(val: string) { return val; }
    static doSomethingElse(val: string) { return val; }

    public GetInstance(pageName: string): any {
        switch (pageName.toLowerCase()) {
            case "links":
                return new Links();
            case "stops":
                return new Stop();
        }
        return null;
    }

    

    public CompareItems(a: CellSelectionItem, b: CellSelectionItem): number {
        if (a.itemKey < b.itemKey) {
            return -1;
        } else if (a.itemKey > b.itemKey) {
            return 1;
        } else {
            // If itemKey is the same, sort by columnKey
            if (a.columnKey < b.columnKey) {
                return -1;
            } else if (a.columnKey > b.columnKey) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    public CompareItemsColumnWise(a: CellSelectionItem, b: CellSelectionItem): number {
        if (a.columnKey < b.columnKey) {
            return -1;
        } else if (a.columnKey > b.columnKey) {
            return 1;
        } else {
            // If itemKey is the same, sort by columnKey
            if (a.itemKey < b.itemKey) {
                return -1;
            } else if (a.itemKey > b.itemKey) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    public createNewFormGroup(dataItem:any, dataPoints:any[],columns:any[], parentIndex:number): FormGroup {
        var controlGrp = this.formBuilder.group({});
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
        columns.forEach(p=>{
          if(p.type!=='list')
          {
            if(p.field=="primarykeyduid")
              controlGrp.addControl(p.field,new FormControl(minPrimarykeyduid-1));
            else if(p.filter==="date")
              controlGrp.addControl(p.field,new FormControl(new Date()));
            else
            {
              if(dataItem==null) 
              {
                if(parentIndex>0 && p.field=="parenttableindex")
                  controlGrp.addControl(p.field,new FormControl(parentIndex));
                else
                  controlGrp.addControl(p.field,new FormControl());
              }
              else
              {
                controlGrp.addControl(p.field,new FormControl(dataItem[p.field]));
              }
            }
          }
          });
          return controlGrp;
      }

      //this method is used to add the edited items in to the array updatetable , so that thi will be
//saved while clik on save chnages
public PushUpdateTable(primarykey: number,value: any,reqdAttribute : string,tableName:string,updatetable:UpdateTable[]): void{
    var splittedArray = reqdAttribute.split('.');
    var reqdTableName = tableName;
    if(splittedArray.length>1)
    {
      reqdTableName=splittedArray[0];
      reqdAttribute=splittedArray[1];
    }
  
    var updatedValueList ={
      primarykey : primarykey,
      keyid: reqdAttribute,
      keyvalue: value as string +''
    };
    var newupdatetable = new UpdateTable();
      newupdatetable.tablename= reqdTableName;
      if(primarykey<0)
        newupdatetable.modetype=1;
      else
        newupdatetable.modetype=2;
      if(reqdTableName.toLowerCase() !== tableName.toLowerCase() )
      {
        newupdatetable.parenttablename = tableName;
      }
      else
      {
        newupdatetable.parenttablename = "";
      }
      newupdatetable.attributelist= [];
      newupdatetable.attributelist.push(updatedValueList);
      
    let indexTableToUpdate  = updatetable.findIndex(item =>item.tablename === newupdatetable.tablename  && item.modetype===newupdatetable.modetype);    
    if(indexTableToUpdate>-1)
    {
      let indexAttrToUpdate  = updatetable[indexTableToUpdate].attributelist.findIndex(item =>item.keyid === updatedValueList.keyid && item.primarykey==updatedValueList.primarykey ); 
      if(indexAttrToUpdate>-1)
      {
        updatetable[indexTableToUpdate].attributelist[indexAttrToUpdate] = updatedValueList;
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
  public createFormGroup(dataItem: any, columns:any): FormGroup {
    var controlGrp = this.formBuilder.group({});
    columns.forEach(p=>{
      if(!p.isreadonly)
      {
        if(p.filter ==="date")
          controlGrp.addControl(p.field,this.formBuilder.control(new Date(dataItem[p.field])) );
        else
          controlGrp.addControl(p.field,this.formBuilder.control(dataItem[p.field]));
      }
    });
    return controlGrp;
  }
  public colorCode(dataitem:any,code: string,editedItems:any[]): any {
    let result ;

    if(this.isEdited(dataitem, code,editedItems))
    {
      return "#FFFF00";
    }
    switch (code) {
      case "AD":
        result = "#FFBA80";
        break;
      case "C2":
        result = "#B2F699";
        break;
      default:
        result = "transparent";
        break;
    }

    return result;
  }
  public isEdited(dataItem: any, columnfield: string,editedItems:any[]): boolean {
    if (editedItems[dataItem.primarykeyduid]?.length && editedItems[dataItem.primarykeyduid]?.indexOf(columnfield) > -1) {
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
  public fontColor(code: string): string {
    let result = "#000000";
  if(code != undefined)
  {
    switch (code.toString()) {
      case "1299":
        result = "#FFBA80";
        break;
      case "ABSW":
        result = "#B2F699";
        break;
      default:
        result = "#000000";
        break;
    }
  }
    return result;
  
  }
  
}