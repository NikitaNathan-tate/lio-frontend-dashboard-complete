import { Params } from '@angular/router';
import { AppConfig } from 'src/app/AppConfig.service';
import { DragAndDropDataType } from 'src/app/map/enums/drag-and-drop-data-type.enum';
import { IDragAndDropData } from 'src/app/map/interfaces/drag-and-drop-data.interface';
//import { StorageItem } from '@app/shared/storage';
//import { Params } from '@angular/router';
//import { VehicleView } from '@app/datamodel';


export abstract class Utils {
  public static readonly dragAndDropDataMimeType = 'application/json';

  /**
   * Used in each place where accessing color from variables.scss is not possible.
   * Make sure it's the same as specified in the sass file
   */
  public static readonly primaryColor = '#b23159';

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  public static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * @param min - inclusive
   * @param max - exclusive
   */
  public static getRandomDoubleInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  
  public static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }
  
  /**
   * Darken / Lighten given color
   *
   * @param hexColor - Hexadecimal color
   * @param percent - Shade (values [0-100], negative value - darken, positive value - lighten)
   */
  public static shadeHexColor(hexColor: string, percent: number): string {
    let R = Number.parseInt(hexColor.substring(1, 3), 16);
    let G = Number.parseInt(hexColor.substring(3, 5), 16);
    let B = Number.parseInt(hexColor.substring(5, 7), 16);
    R = Number.parseInt(String(R * (100 + percent) / 100), 10);
    G = Number.parseInt(String(G * (100 + percent) / 100), 10);
    B = Number.parseInt(String(B * (100 + percent) / 100), 10);
    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;
    R = Math.round(R);
    G = Math.round(G);
    B = Math.round(B);
    const RR = ((R.toString(16).length === 1) ? '0' + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? '0' + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? '0' + B.toString(16) : B.toString(16));
    return '#' + RR + GG + BB;
  }

  public static isVerticalOverflown(
    { clientHeight, scrollHeight }: { clientHeight: number; scrollHeight: number },
  ): boolean {
    return scrollHeight > clientHeight;
  }

  public static isHorizontalOverflown(
    { clientWidth, scrollWidth }: { clientWidth: number; scrollWidth: number },
  ): boolean {
    return scrollWidth > clientWidth;
  }

  

  public static isSecondaryMouseButtonEvent(evt: MouseEvent): boolean {
    return evt.button === 2;
  }

  public static setDragAndDropData(evt: DragEvent, duid: string, type: DragAndDropDataType): void {
    const eventData: IDragAndDropData = { type, duid };
    evt.dataTransfer?.setData(Utils.dragAndDropDataMimeType, JSON.stringify(eventData));
    evt.stopPropagation();
  }

  public static getDragAndDropData(evt: DragEvent): IDragAndDropData | undefined {
    const dataText = evt.dataTransfer?.getData(Utils.dragAndDropDataMimeType);
    if (dataText) {
      return JSON.parse(dataText);
    }
    return undefined;
  }

  public static onDragOverEventForDND(evt: DragEvent): void {
    evt.preventDefault();
  }

  public static onDropEventForDND(evt: DragEvent): void {
    evt.stopPropagation(); // Stops some browsers from redirecting.
    evt.preventDefault();
  }

  public static trackByDuid(_index: number, item: { duid: string | number }): string {
    return `${ item.duid }`;
  }

  
  private static windowsTab: Window[]=[];
  private static windowsNew: Window[]=[];
  public static closeExistingWindow()
  {
    if(this.windowsTab.length>0)
      this.windowsTab[0].close();
    this.windowsTab.splice(0);
  }
  public static openInNewWindow(route: string[], queryParams?: Params, noNavbar = false, windowWidth = 1200, windowHeight = 800): void {
    let url = AppConfig.settings.angularSubDirUrl+`/` + route[0];
    const paramsString = queryParams ? Object.entries(queryParams).map(([key, value]) => `${ key }=${ value.toString() }`).join('&') : '';
    url = paramsString ? `${ url }?${ paramsString }` : url;
    const settings = `toolbar=0,location=0,menubar=0,directories=no,status=no,titlebar=no,alwaysRaised=yes,width=${ windowWidth },height=${ windowHeight }`;
    
    if(noNavbar)
    {
      if(this.windowsNew.length>0 && !this.windowsNew[0].closed)
      {
        //  this.windowsNew[0].location.href = url;
        this.windowsNew[0].focus();
        const dataToSend = { message: paramsString };
        this.windowsNew[0].postMessage(dataToSend, '*');
      }
      else
      {
        this.windowsNew.splice(0);
        var  openedWindow = window.open(url, '_blank',settings);
        this.windowsNew.push(openedWindow);
      }
    }
    else
    {
      if(this.windowsTab.length>0 && !this.windowsTab[0].closed)
      {
        //this.windowsTab[0].location.href = url;
        this.windowsTab[0].focus();
        const dataToSend = { message: paramsString };
        this.windowsTab[0].postMessage(dataToSend, '*');
      }
      else
      {
        this.windowsTab.splice(0);
        var  openedWindow = window.open(url, '_blank');      
        this.windowsTab.push(openedWindow);
      }
    }
    //openedWindow?.sessionStorage.setItem(StorageItem.NoNavbar, JSON.stringify(noNavbar));
  }
}
