import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventData } from '../../core/models/EventData.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent {
  @Input() event!: EventData;

}
