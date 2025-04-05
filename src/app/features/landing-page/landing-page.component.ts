import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  empresas: EmpresaData[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    public loadingService: LoadingService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadingService.loading();
    this.fetchData();
  }

  private fetchData(): void {
    this.apiService.getEmpresas().subscribe({
      next: (data: any[]) => {
        console.log('Dades rebudes de l\'API (abans de transformar):', data);
        this.empresas = data.map(item => item.empresa).slice(0, 6);
        console.log('Empreses després de transformar:', this.empresas);
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
    this.apiService.getServiciosByIdentificadorFiscal(empresa.identificadorFiscal).subscribe({
      next: (servicios: ServicioData[]) => {
        empresa.servicios = servicios; // Assigna els serveis a l'empresa
        console.log(`Serveis per a l'empresa ${empresa.nombre}:`, servicios);
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        console.error(`Error al obtenir els serveis per a l'empresa ${empresa.nombre}:`, error.message);
      }
    });
  }
}
