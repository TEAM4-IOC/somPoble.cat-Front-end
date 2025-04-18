import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SearchComponent } from '../../shared/component/search/search.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-show-services',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    SearchComponent,
    
  ],
  templateUrl: './show-services.component.html',
  styleUrls: ['./show-services.component.scss']
})
export class ShowServicesComponent implements OnInit {
  services$!: Observable<ServicioData[]>;
  originalServices: ServicioData[] = []; // Almacena la lista original de servicios

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const identificadorFiscal = this.route.snapshot.paramMap.get('identificadorFiscal');
    if (identificadorFiscal && identificadorFiscal.trim() !== '') {
      this.services$ = this.apiService.getServiciosByIdentificadorFiscal(identificadorFiscal)
        .pipe(
          tap((services: ServicioData[]) => {
            this.originalServices = services;
          }),
          catchError(error => {
            console.error("Error al obtener els serveis per a l'empresa:", error);
            return of([]);
          })
        );
    } else {
      this.services$ = this.apiService.getServicios()
        .pipe(
          tap((services: ServicioData[]) => {
            this.originalServices = services;
          }),
          catchError(error => {
            console.error("Error al obtener todos los servicios:", error);
            return of([]);
          })
        );
    }
  }

  onSelectService(service: ServicioData): void {
    this.router.navigate(['/service-detail', service.idServicio, service.identificadorFiscal]);
  }

  trackByServiceName(index: number, service: ServicioData): string {
    return service.nombre;
  }

  public filterServices(searchTerm: string): void {
    if (!searchTerm) {
      this.services$ = of(this.originalServices);
      return;
    }

    const filteredServices = this.originalServices.filter(service =>
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    this.services$ = of(filteredServices);
  }

  formatDays(diasLaborables: string): string {
    const dayOrder = ['1', '2', '3', '4', '5', '6', '7']; // Orden dels dies
    const diasOrdenados = diasLaborables
      .split(',')
      .sort((a, b) => dayOrder.indexOf(a.trim()) - dayOrder.indexOf(b.trim()));
  
    return diasOrdenados
      .map(dia => this.translate.instant(`serviceDetail.days.${dia.trim()}`))
      .join(', ');
  }
  
  formatHours(horarioInicio: string, horarioFin: string): string {
    return `${horarioInicio.slice(0, 5)} a ${horarioFin.slice(0, 5)}`;
  }
}
