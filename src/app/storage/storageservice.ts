import { Injectable } from '@angular/core';
import { AppConfig } from '../AppConfig.service';
import { ObjectStore } from './storage.enums';

@Injectable({
  providedIn: 'root',
})

export class StorageService  {

  //members
  private dbName = 'LIODATAINDEXDB';
  private dbVersion = AppConfig.settings.dbVersion;
  private objectStoreTableSetting = 'TableSetting';
  private objectStoreTableDefinition = 'TableDefinition';
  private objectStoreRepresentation = 'Representation';
  private objectStoreUserSetting = 'UserSetting';
  private objectStoreWindowSetting = 'WindowSetting';
  private objectStoreLinkColumn = 'LinkColumn';

  private static db: IDBDatabase | null = null;
  objectStoreDefinitions: { name: ObjectStore, key: string }[] = [
    { name: ObjectStore.TableSetting, key: 'tableName' },
    { name: ObjectStore.TableDefinition, key: 'Name' },
    { name: ObjectStore.Representation, key: 'Name' }, 
    { name: ObjectStore.UserSetting, key: 'Name' }, // Replace with the actual key
    { name: ObjectStore.WindowSetting, key: 'Name' }, // Replace with the actual key
    { name: ObjectStore.LinkColumn, key: 'Name' }, // Replace with the actual key
    { name: ObjectStore.TableValue, key: 'Name' }, // Replace with the actual key
  ];

  constructor() {
    if(StorageService.db == null || StorageService.db == undefined)
    this.openDatabase();
  }

  private openDatabase(): void {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (event: any) => {
      const db = event. target.result;
    //below code creates the table in the indexed DB
      this.objectStoreDefinitions.forEach(element => {
        if(!db.objectStoreNames.contains(element.name))
        {
         db.createObjectStore(element.name, {
         keyPath : element.key,
         autoIncrement:true
        });
        }
        else {
          // The object store already exists, so you can clear its data
          const transaction = event.target.transaction;
          const store = transaction.objectStore(element.name);
          store.clear(); // This clears all data in the object store
        }
      });

    }
    request.onsuccess = (event: any) => {
      StorageService.db = event.target.result;
    };

    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.error);
    };
  }

 
  public async addItem(item: any, storeName: string,key:string): Promise<void> {
    let db: IDBDatabase ;
    if(StorageService.db != undefined)
       db = StorageService.db;
      else
      db = await this.getDatabase();
    const transaction = db.transaction([storeName], 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll(item.Name);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
    
        objectStore.delete(key);
        objectStore.add(item);

        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
    //objectStore.add(item);
  }
  public async removeItem(storeName: string,key): Promise<void>{
    let db: IDBDatabase ;
    if(StorageService.db != undefined)
       db = StorageService.db;
      else
      db = await this.getDatabase();
    const transaction = db.transaction([storeName], 'readwrite')
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll(storeName);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
    
        if(key==='0')
          objectStore.clear();
        else
          objectStore.delete(key);
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
}

  public async getAllItems(): Promise<any[]> {
    const db = await this.getDatabase();
    const transaction = db.transaction([this.objectStoreTableSetting], 'readonly');
    const objectStore = transaction.objectStore(this.objectStoreTableSetting);
    const request = objectStore.getAll();

    return new Promise<any[]>((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        console.error('Error getting items from IndexedDB:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  public async getRequiredItem(key,storeName : string): Promise<any[]> {
    const db   = await this.getDatabase();
    const transaction = db.transaction([storeName], 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }

  private async getDatabase(): Promise<IDBDatabase> {
    const dbName = this.dbName;
  const dbVersion = this.dbVersion;
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onsuccess = (event: any) => {
        StorageService.db = event.target.result;
        resolve(StorageService.db);
      };

      request.onerror = (event: any) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
}
