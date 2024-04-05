import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-zoom-panel',
  templateUrl: './zoom-panel.component.html',
  styleUrls: ['./zoom-panel.component.scss'],
})
export class ZoomPanelComponent {
  @Input() public zoomInDisabled = false;
  @Input() public zoomOutDisabled = false;

  @Output() public readonly zoomIn = new EventEmitter<void>();
  @Output() public readonly zoomOut = new EventEmitter<void>();

  public onZoomInButtonClick(): void {
    this.zoomIn.emit();
  }

  public onZoomOutButtonClick(): void {
    this.zoomOut.emit();
  }
}
