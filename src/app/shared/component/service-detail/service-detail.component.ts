import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ServicioData } from '../../../core/models/ServicioData.interface';
import { ServiceStateService } from '../../../core/services/service-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceDetailComponent implements OnInit {
  service$!: Observable<ServicioData | undefined>;
  formattedDays$!: Observable<string | undefined>;
  formattedHours$!: Observable<string | undefined>;

  private dayOrder = ['1', '2', '3', '4', '5', '6', '7'];

  constructor(
    private route: ActivatedRoute,
    private serviceStateService: ServiceStateService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const identificadorFiscal = this.route.snapshot.paramMap.get('identificadorFiscal')!;
    this.service$ = this.serviceStateService.getServicioHorarioById(identificadorFiscal, id);

    this.formattedDays$ = combineLatest([
      this.service$,
      this.translate.stream('serviceDetail.days') 
    ]).pipe(
      switchMap(([service]) => {
        if (!service) return [undefined];

        const diasOrdenados = service.diasLaborables
          .split(',')
          .sort((a, b) => this.dayOrder.indexOf(a.trim()) - this.dayOrder.indexOf(b.trim()));

        return combineLatest(
          diasOrdenados.map(dia => this.translate.get(`serviceDetail.days.${dia.trim()}`))
        ).pipe(
          map(translatedDays => translatedDays.join(', '))
        );
      })
    );

    this.formattedHours$ = this.service$.pipe(
      map(service => {
        if (!service) return undefined;

        const horarioInicio = service.horarioInicio.slice(0, 5);
        const horarioFin = service.horarioFin.slice(0, 5);

        return `${horarioInicio} a ${horarioFin}`;
      })
    );
  }

  goToReservation(service: ServicioData | undefined): void {
    if (!service) return;

    this.router.navigate(['/reserves-cli'], {
      queryParams: {
        id: service.idServicio,
        identificadorFiscal: service.identificadorFiscal,
      }
    });
  }
}