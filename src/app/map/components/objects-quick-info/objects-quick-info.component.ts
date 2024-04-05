import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IStop } from 'src/app/features/networkdata/components/stops/interfaces';
import { IStopPoint } from 'src/app/features/networkdata/components/stops/interfaces/stoppoint.interface';

@Component({
  selector: 'app-objects-quick-info',
  templateUrl: './objects-quick-info.component.html',
  styleUrls: ['./objects-quick-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectsQuickInfoComponent {
  @Input() public selectedStop?: IStop;
  @Input() public selectedStopPoint?: IStopPoint;
  @Input() public mouseoverStopPoint?: IStopPoint;
  @Input() public mouseoverPatternStopPoint?:IStopPoint;
}
