import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-show-services',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './show-services.component.html',
  styleUrls: ['./show-services.component.scss']
})
export class ShowServicesComponent implements OnInit {
  services$!: Observable<ServicioData[]>;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const identificadorFiscal = this.route.snapshot.paramMap.get('identificadorFiscal');
    if (identificadorFiscal && identificadorFiscal.trim() !== '') {
      this.services$ = this.apiService.getServiciosByIdentificadorFiscal(identificadorFiscal)
        .pipe(
          catchError(error => {
            console.error("Error al obtener els serveis per a l'empresa:", error);
            return of([]);
          })
        );
    } else {
      this.services$ = this.apiService.getServicios()
        .pipe(
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
}
