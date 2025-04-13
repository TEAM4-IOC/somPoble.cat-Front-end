import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EventData } from '../models/EventData.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventStateService {
  private eventSubject: BehaviorSubject<EventData[]> = new BehaviorSubject<EventData[]>([]);
  public events$: Observable<EventData[]> = this.eventSubject.asObservable();

  constructor(private apiService: ApiService) {}

  private saveAndEmit(events: EventData[]): void {
    this.eventSubject.next(events);
  }

  loadEvents(): void {
    this.apiService.getEventos().subscribe({
      next: (events: EventData[]) => {
        this.saveAndEmit(events);
      },
      error: (err: any) => {
        console.error('[EventStateService] Error fetching events:', err);
        this.saveAndEmit([]);
      }
    });
  }

}
