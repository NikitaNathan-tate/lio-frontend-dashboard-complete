import { Injectable } from '@angular/core';
import { Notifications } from './notifications';
import { NotificationType } from './enums/notifications-type.enums';   
import { BehaviorSubject , Observable } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationPanelService {
  private dbName: string = 'myDB';
  private storeName: string = 'notification';
  private static db: IDBDatabase;
  public notifications$ : Observable<Notifications[]>;;

  private cartCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  notifications1$ = this.cartCountSubject.asObservable();
  private dbVersion = AppConfig.settings.dbVersion;

  constructor() {
    this.openDatabase();
    
  }
  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }
  private openDatabase(): void {
   const request = indexedDB.open(this.dbName,6);
    request.onupgradeneeded = (event: any) => {
      NotificationPanelService.db = event.target.result;
      if (!NotificationPanelService.db.objectStoreNames.contains(this.storeName)) 
        {
          const store = NotificationPanelService.db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
     store.createIndex("notificationType", ["notificationType"], { unique: false });
    }
    };

    request.onsuccess = (event: any) => {
      NotificationPanelService.db = event.target.result;
      const transaction = NotificationPanelService.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      objectStore.clear();
       let newItem: Notifications = {
        id: 1,
        text : "Application Started",
        datetime :  new Date().getTime(),
        type: NotificationType.Info
      };
      this.addItem(newItem);

      newItem = {
        id: 3,
        text : "Lio-Data Smart Client is not properly configured",
        datetime :  new Date().getTime(),
        type: NotificationType.Warning
      };
      this.addItem(newItem);

    };

    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.error);
    };
  }

  public clearStore()
  {
    const transaction = NotificationPanelService.db.transaction([this.storeName], 'readwrite');
    const objectStore = transaction.objectStore(this.storeName);
    objectStore.clear();
  }
  public addItem(item: any): void {
    const transaction = NotificationPanelService.db.transaction([this.storeName], 'readwrite');
    const objectStore = transaction.objectStore(this.storeName);
    const request = objectStore.put(item);
    request.onsuccess = (event: any) => {
      const currentCount = this.cartCountSubject.value;
      this.updateCartCount(currentCount + 1);
      console.log('Item added to IndexedDB');
    };

    request.onerror = (event: any) => {
      console.error('Error adding item to IndexedDB:', event.target.error);
    };
  }

  public async getAllItems(): Promise<any[]> {
    const db = await this.getDatabase();

    
    return new Promise((resolve, reject) => {
      let db = NotificationPanelService.db;
      let storeName = this.storeName;
      const transaction =db.transaction([storeName], 'readonly');
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.getAll();

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
        NotificationPanelService.db = event.target.result;
        resolve(NotificationPanelService.db);
      };

      request.onerror = (event: any) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
}
