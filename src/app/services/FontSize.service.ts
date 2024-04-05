import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {

  private fontSize: number = 14;

constructor() { }

  setFontSize(size: number) {
    this.fontSize = size;
    document.documentElement.style.setProperty('--user-font-size', `${this.fontSize}px`);
    document.documentElement.style.setProperty('--dynamic-font-size', `${this.fontSize}px`);

  }

  getFontSize(): number {
    return this.fontSize;
  }
}
