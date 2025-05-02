import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Metrics } from '../models/metrics.interface';

@Injectable({
  providedIn: 'root'
})
export class MetricsStateService {
  private metricsSubject = new ReplaySubject<Metrics>(1);
  public readonly metrics$: Observable<Metrics> = this.metricsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  public loadMetrics(start: string, end: string): void {
    const raw = localStorage.getItem('session');
    if (!raw) {
      console.error('[MetricsState] no session in localStorage');
      return;
    }

    let session: any;
    try {
      session = JSON.parse(raw);
    } catch {
      console.error('[MetricsState] invalid session JSON');
      return;
    }

    const fiscalId = session.usuario?.empresas?.[0]?.identificadorFiscal;
    if (!fiscalId) {
      console.error('[MetricsState] no fiscalId in session');
      return;
    }

    console.log('[MetricsState] loading metrics for', { fiscalId, start, end });
    this.apiService.getMetrics(fiscalId, start, end).subscribe({
      next: metrics => {
        console.log('[MetricsState] metrics received', metrics);
        this.metricsSubject.next(metrics);
      },
      error: err => {
        console.error('[MetricsState] metrics load error', err);
      }
    });
  }
}
