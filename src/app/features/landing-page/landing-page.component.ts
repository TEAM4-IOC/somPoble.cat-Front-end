import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { ApiService } from '../../core/services/api.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmpresaData } from '../../core/models/EmpresaData.interface';
import { EventData } from '../../core/models/EventData.interface';
import { EventStateService } from '../../core/services/event-state.service';
import { SearchComponent } from '../../shared/component/search/search.component';
import { EventComponent } from '../event/event.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    NgxSpinnerModule,
    TranslateModule,
    RouterModule,
    CommonModule,
    SearchComponent,
    EventComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  empresas: EmpresaData[] = [];
  private originalEmpresas: EmpresaData[] = [];

  eventos: EventData[] = [];
  private originalEventos: EventData[] = [];

  isFiltering = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    public readonly loadingService: LoadingService,
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly eventStateService: EventStateService
  ) {}

  ngOnInit(): void {
    this.loadingService.loading();
    this.fetchEmpresas();
    this.eventStateService.loadEvents();
    this.eventStateService.events$.subscribe(events => {
      this.originalEventos = events;
      this.eventos = [...this.originalEventos];
      this.cdr.detectChanges();
    });
  }

  private fetchEmpresas(): void {
    this.apiService.getLandingData().subscribe({
      next: empresas => {
        this.originalEmpresas = empresas.slice(0, 6);
        this.empresas = [...this.originalEmpresas];
        this.cdr.detectChanges();
      },
      error: err => console.error('Error fetching landing data:', err),
      complete: () => setTimeout(() => this.loadingService.idle(), 0)
    });
  }

  goToCompanyServices(empresa: EmpresaData): void {
    this.router.navigate(['/show-services', empresa.identificadorFiscal]);
  }

  trackByEmpresa(_: number, e: EmpresaData): number {
    return e.idEmpresa;
  }

  trackByEvento(_: number, e: EventData): number {
    return e.idEvento;
  }

  public filterEmpresas(searchTerm: string): void {
    const term = searchTerm.trim().toLowerCase();
    this.isFiltering = term.length > 0;

    this.empresas = !term
      ? [...this.originalEmpresas]
      : this.originalEmpresas.filter(e =>
          (e.nombre ?? e.actividad ?? '').toLowerCase().includes(term)
        );

    this.eventos = !term
      ? [...this.originalEventos]
      : this.originalEventos.filter(ev =>
          ev.nombre.toLowerCase().includes(term)
        );

    this.cdr.detectChanges();
  }
}
