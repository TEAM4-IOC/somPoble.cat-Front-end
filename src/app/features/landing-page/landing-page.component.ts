import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { ApiService } from '../../core/services/api.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EmpresaData } from '../../core/models/EmpresaData.interface';
import { ServicioData } from '../../core/models/ServicioData.interface';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NgxSpinnerModule, TranslateModule, RouterModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  empresas: EmpresaData[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    public loadingService: LoadingService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadingService.loading();
    this.fetchData();
  }

  private fetchData(): void {
    this.apiService.getEmpresas().subscribe({
      next: (data: any[]) => {
        this.empresas = data.map(item => item.empresa).slice(0, 6);
        this.empresas.forEach(empresa => this.fetchServicios(empresa));
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener los datos:', error.message);
      },
      complete: () => {
        setTimeout(() => this.loadingService.idle(), 0);
      }
    });
  }

  private fetchServicios(empresa: EmpresaData): void {
    this.apiService.getServicios().subscribe({
      next: (servicios: ServicioData[]) => {
        empresa.servicios = servicios.filter(s => s.identificadorFiscal === empresa.identificadorFiscal);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Error al obtenir els serveis per a l'empresa ${empresa.nombre}:`, error.message);
      }
    });
  }

  goToCompanyServices(empresa: EmpresaData): void {
    this.router.navigate(['/show-services', empresa.identificadorFiscal]);
  }
  trackByEmpresa(index: number, empresa: EmpresaData): number {
    return empresa.idEmpresa;
  }

  trackByServicio(index: number, servicio: ServicioData): number {
    return servicio.idServicio;
  }

}
