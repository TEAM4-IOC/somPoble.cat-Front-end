import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';

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
  services$: Observable<ServicioData[]>;

  constructor(private apiService: ApiService, private router: Router) {
    this.services$ = new Observable<ServicioData[]>();
  }

  ngOnInit(): void {
    this.services$ = this.apiService.getServicios();
  }

  onSelectService(service: ServicioData): void {
    this.router.navigate(['/service-detail', service.idServicio, service.identificadorFiscal]);
  }


  trackByServiceName(index: number, service: ServicioData): string {
    return service.nombre;
  }
}
