import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData } from 'chart.js';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MetricsStateService } from '../../core/services/metrics-state.service';
import { Metrics } from '../../core/models/metrics.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-metricas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgChartsModule,
    TranslateModule
  ],
  templateUrl: './metricas.component.html',
  styleUrls: ['./metricas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricasComponent {
  public form: FormGroup;
  public metrics$: Observable<Metrics>;
  public reservationsChartData$: Observable<ChartData<'bar'>>;
  public ingresosChartData$: Observable<ChartData<'bar'>>;

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        labels: {
          color: '#000',
          font: { size: 16 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#000', font: { size: 16 } },
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      y: {
        ticks: { color: '#000', font: { size: 16 } },
        grid: { color: 'rgba(0,0,0,0.1)' }
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private metricsState: MetricsStateService
  ) {
    this.form = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin:    ['', Validators.required]
    });

    this.metrics$ = this.metricsState.metrics$;

    this.reservationsChartData$ = this.metrics$.pipe(
      map(metrics => ({
        labels: metrics.mensual.map(item => item.mes),
        datasets: [
          {
            data: metrics.mensual.map(item => item.reservas),
            label: 'Reservas',
            backgroundColor: '#67b8e8',
            borderColor: '#005f99',
            borderWidth: 2
          }
        ]
      }))
    );

    this.ingresosChartData$ = this.metrics$.pipe(
      map(metrics => ({
        labels: metrics.mensual.map(item => item.mes),
        datasets: [
          {
            data: metrics.mensual.map(item => item.ingresos),
            label: 'Ingresos',
            backgroundColor: '#905f99',
            borderColor: '#663366',
            borderWidth: 2
          }
        ]
      }))
    );
  }

  public onBuscar(): void {
    if (this.form.valid) {
      const { fechaInicio, fechaFin } = this.form.value;
      this.metricsState.loadMetrics(fechaInicio, fechaFin);
    }
  }
}
