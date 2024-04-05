import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { PopupModule } from '@progress/kendo-angular-popup';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'center-popup',
  templateUrl: './center-popup.component.html',
  styleUrls: ['./center-popup.component.css']
})
export class CenterPopupComponent implements OnInit {

  constructor() { }

  @Input() showPopup: boolean = false;
  @Input() heading: string = '';
  @Input() height: string = '';
  @Input() width: string = '';
  @Output() closePopup = new EventEmitter<void>();


  ngOnInit() {
  }
  close() {
    this.closePopup.emit();
  }
}

@NgModule({
  declarations: [CenterPopupComponent], 
  imports: [CommonModule, PopupModule,MatIconModule],
  exports: [CenterPopupComponent]
})
export class CenterPopupModule { }
