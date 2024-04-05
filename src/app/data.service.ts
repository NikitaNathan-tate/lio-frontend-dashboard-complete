import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of, tap } from 'rxjs';
import { StorageService } from './storage/storageservice';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  dataLoaded: Subject<boolean> = new Subject<boolean>();
  private static dataCache: { [key: string]: Observable<any[]> } = {};
  constructor(private http: HttpClient,public storageService: StorageService) {}
  public bvNumber:number;
  async fetchDataFromApi(key: string, url: string,childTable:boolean): Promise<any[]> {
    // Attempt to get data from indexdb
    const tableValues = await this.storageService.getRequiredItem(this.bvNumber+'_'+key, 'TableValue');
    if (tableValues.length > 0) {
      if(tableValues[0].columns.length >0)
      {
        // Data exists in indexdb, parse and return it
        return  tableValues[0].columns ;
      }
    }    
    // Data not found in indexdb, fetch from the API
    var request = await  this.http.get<any[]>(url).toPromise();
    try 
    {
      const response = await request;
      const tableData = 
      {
        Name: this.bvNumber+'_'+key,
        columns: response
      };
      // Store the fetched data in indexdb
      if((childTable && key==="stoppoints") || !childTable)
      {
        this.storageService.addItem(tableData, 'TableValue',this.bvNumber+'_'+key);
      }
      if(childTable)
        this.dataLoaded.next(true);
      return response;
    } catch (error) {
      // Handle errors here
      console.error('Error fetching data:', error);
      return [];
    }
  }
   
  public columnFilterValues: { [key: string]: any[] } = {};
  public keysArray: string[];
  public gridData: any;
  async processLinksData(filteredArray,gridData,storageService,bvNumber:number) {
    this.gridData = gridData;
    for (const element of filteredArray) {
      try {
        {
          const columns1 = await storageService.getRequiredItem(bvNumber+'_'+element['refTable'].toLowerCase(), 'LinkColumn');
          let fieldName: string;
          fieldName = element['field'];
          const representationTable = await storageService.getRequiredItem(bvNumber+'_'+element['representationTable'].toLowerCase(), 'Representation');
          if (columns1.length > 0) {
            this.gridData.forEach((item) => {
              const filteredData = columns1[0].columns.filter(i => i['linkindex'] == item['primarykeyduid']);
              const matchingRepresentations = [];
              filteredData.forEach(item1 => {
                var fetchedColumns = representationTable[0].columns;
                for (let key in fetchedColumns) {
                  if (+key==item1['idx']) {
                    matchingRepresentations.push(fetchedColumns[key]);
                    break;
                  }
                }
                // const matchingItem = fetchedColumns.find(s => +s == Number(item1['idx']));
                // if (matchingItem) {
                //   matchingRepresentations.push(matchingItem.representation);
                // }
              });
              item[fieldName] = matchingRepresentations.join(', ');
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  

//this will load the columnFilterValues, so that it will not be repeated each time the processArray is called
async fillDropDownValues(filteredArray, storageService)  
{
  for (const element of filteredArray) {
    try {
      const columns1 = await storageService.getRequiredItem(element.refTable.toLowerCase(), 'Representation');
      if (columns1.length > 0) {
        const mappedData = columns1[0].columns.map(item => ({
          Value: item.idx,
          Text: item.representation,
        }));
      
        if (this.columnFilterValues[element.field]) {
          this.columnFilterValues[element.field] = this.columnFilterValues[element.field].concat(mappedData);
        } else {
          this.columnFilterValues[element.field] = mappedData;
        }
      this.keysArray = Object.keys(this.columnFilterValues);
    }
    } catch (error) {
      console.error(error);
    }
  }
}

  async processArray(filteredArray, gridData, storageService, allColumns) {
    this.gridData = gridData;
    // this populates the dropdowns in the grid
    const columnsWithSetItems = allColumns.filter(column => column.SetItems);
    columnsWithSetItems.forEach(column => {
      allColumns.forEach(column => {
        if (column.SetItems.length > 0) {
          this.columnFilterValues[column.field] = column.SetItems;
          this.keysArray = Object.keys(this.columnFilterValues);
          this.gridData.forEach((item) => {
            const matchingItem = column.SetItems.find((secondItem) => secondItem.Value === item[column.field]);
            if (matchingItem) {
              item[column.field] = matchingItem.Text;
            }
          });
        }        
      });
    });
    for (const element of filteredArray) {
      try {
        if (this.columnFilterValues.hasOwnProperty(element.field)) {
          const valuesArray = this.columnFilterValues[element.field];
        this.gridData.forEach((item) => {
          let num : number =  item[element.field];
          const matchingItem = valuesArray.find(item => item.Value ===  num);
          if (!(matchingItem === undefined)) {
            item[element.field] = matchingItem.Text;
          }
        });
        } else {
          const columns1 = await storageService.getRequiredItem(element.refTable.toLowerCase(), 'Representation');
        if (columns1.length > 0) {
          const mappedData = columns1[0].columns.map(item => ({
            Value: item.idx,
            Text: item.representation,
          }));
        
          if (this.columnFilterValues[element.field]) {
            this.columnFilterValues[element.field] = this.columnFilterValues[element.field].concat(mappedData);
          } else {
            this.columnFilterValues[element.field] = mappedData;
          }
        }
      }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
