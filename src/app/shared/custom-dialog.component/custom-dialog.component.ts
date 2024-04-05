import { outputAst } from '@angular/compiler';
import { Component , Input, Output,EventEmitter} from '@angular/core';
import { ActionsLayout } from '@progress/kendo-angular-dialog';

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponentComponent {
  @Input() opened: boolean;
  @Input() isConfirmationDialog: boolean; 
  @Input() confirmationMessage: string;

  //this is for the confirmantion dialog
  @Output() yesClick : EventEmitter<void> = new EventEmitter<void>();
  @Output() noClick : EventEmitter<void> = new EventEmitter<void>();
  @Input() isInformationDialog: boolean; 
  public actionsLayout: ActionsLayout = "end";
  //this is for the information dialog
/**
 *
 */
constructor() {
  
  
}   
public ngOnInit () : void
{

  
}
  close(result: string): void {
    this.opened = false;
  }

  onDialogClose(): void {
    this.opened = false;
  }

onNoButtonClick() : void
{
  this.noClick.emit();
  this.close('no')
}
onYesButtonClick() : void {
  this.yesClick.emit()
  this.close('yes')
}
  onDeleteData(): void {
  }
}
