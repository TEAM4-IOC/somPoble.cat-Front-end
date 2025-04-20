import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventData } from '../../core/models/EventData.interface';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventComponent {
  @Input({ required: true }) event!: EventData;

  constructor(private readonly router: Router) {}

  navigate(): void {
    this.router.navigate(['/event-detail', this.event.idEvento]);
  }
}
