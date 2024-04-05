import {
  Directive,
  EventEmitter,
  HostListener,
  Output
} from '@angular/core';

@Directive({
  selector: '[customPaste]'
})
export class CustomPasteDirective {
  @Output()
  public customPaste: EventEmitter<any[]> = new EventEmitter<any[]>();

  @HostListener("paste", ["$event"])
  public onPaste(e: any) {
    if (e.target.tagName && e.target.tagName.match(/(input|textarea)/i)) {
      // Do not handle past when an input element is currently focused
      return;
    }

    // Get clipboard data as text
    let data = e.clipboardData.getData('text');
    {
      data = data.replace(/\r/g, '');
    }
    // Simplified parsing of the TSV data with hard-coded columns
    const rows = data.split('\n');

    const result = rows.map(row => {
      const cells = row.split('\t');
      const rowData: { [key: string]: string } = {};
      cells.forEach((cell, index) => {
        if(cell != ' ')
        {
          const columnName = `Column${index + 1}`; // Generate a dynamic column name
          rowData[columnName] = cell;
        }
      });
      return rowData;
    });
    this.customPaste.emit(result);
  }
}

