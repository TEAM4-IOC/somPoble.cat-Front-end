import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError, shareReplay } from 'rxjs/operators';
import { EventData } from '../../../core/models/EventData.interface';
import { ApiService } from '../../../core/services/api.service';

interface DetailItem {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent {
  readonly event$: Observable<EventData | null>;
  readonly details$: Observable<readonly DetailItem[]>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
  ) {
    this.event$ = this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => this.apiService.getEvento(id)),
      catchError(() => of(null)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.details$ = this.event$.pipe(
      map((event) => {
        if (!event) return [];
        return [
          { label: 'event.location_label', value: event.ubicacion },
          {
            label: 'event.date_label',
            value: new Date(event.fechaEvento).toLocaleString(),
          },
        ] as const;
      }),
    );
  }
}
