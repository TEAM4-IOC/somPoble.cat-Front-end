import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ServicioData } from '../models/ServicioData.interface';
import { CreateServicePayload } from '../models/create-service-payload.interface';
import { map } from 'rxjs/operators';

function isEmptyService(servicio: ServicioData): boolean {
  return !servicio || !servicio.nombre || servicio.nombre.trim() === '';
}

@Injectable({
  providedIn: 'root'
})
export class ServiceStateService {

  private readonly mockServiciosUrl = '/assets/mock-servicios.json'; // Ruta al fitxer JSON
  private serviceSubject: BehaviorSubject<ServicioData[]>;
  public service$: Observable<ServicioData[]>;

  private deletionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public deletion$: Observable<boolean> = this.deletionSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.serviceSubject = new BehaviorSubject<ServicioData[]>([]);
    this.service$ = this.serviceSubject.asObservable();
  }

  private saveAndEmit(services: ServicioData[]): void {
    this.serviceSubject.next(services);
  }

  public getServicesValue(): ServicioData[] {
    return this.serviceSubject.getValue();
  }

  loadServiciosByEmpresaId(empresaId: number): void {
    console.log('[ServiceStateService] loadServiciosByEmpresaId =>', empresaId);
    this.apiService.getServicios().subscribe({
      next: (servicios: any[]) => {
        console.log('[ServiceStateService] GET servicios success:', servicios);
        const empresaServices = servicios.filter(s => s.idEmpresa === empresaId);
        if (empresaServices.length > 0) {
          this.saveAndEmit(empresaServices);
          console.log('[ServiceStateService] Servicios encontrados:', empresaServices);
        } else {
          console.warn('[ServiceStateService] No se encontraron servicios para la empresa ID:', empresaId);
          this.saveAndEmit([]);
        }
      },
      error: (err: any) => {
        console.error('[ServiceStateService] GET servicios error:', err);
        this.saveAndEmit([]);
      }
    });
  }

  createService(payload: CreateServicePayload, empresaId: number): void {
    console.log('[ServiceStateService] createService => payload:', payload);
    this.apiService.createServicio(payload).subscribe({
      next: () => {
        console.log('[ServiceStateService] POST success => updating state...');
        this.loadServiciosByEmpresaId(empresaId);
      },
      error: (err) => {
        console.error('[ServiceStateService] POST error:', err);
        this.loadServiciosByEmpresaId(empresaId);
      }
    });
  }

  updateServiceField(partial: Partial<ServicioData>): void {
      const current = this.getServicesValue();
      if (current.length > 0) {
        const servicioId = current[0].idServicio;
        console.log('[ServiceStateService] updateEnterpriseField using fiscalId =>', servicioId, 'partial:', partial);
        this.apiService.updateServicio(servicioId, partial).subscribe({
          next: (updated: ServicioData) => {
            console.log('[ServiceStateService] PUT success => updated:', updated);
            if (isEmptyService(updated)) {
              this.saveAndEmit([]);
            } else {
              this.saveAndEmit([updated]);
            }
          },
          error: (err) => {
            console.error('[ServiceStateService] PUT error:', err);
          }
        });
      } else {
        console.warn('[ServiceStateService] No service available to update');
      }
    }

  deleteServicio(id: number): void {
    console.log('[ServiceStateService] deleteService => id:', id);
    this.apiService.deleteServicio(id).subscribe({
      next: () => {
        console.log('[ServiceStateService] DELETE success => removing service');
        const filtered = this.getServicesValue().filter(s => s.idServicio !== id);
        this.saveAndEmit(filtered);
        this.deletionSubject.next(true);
      },
      error: (err) => {
        console.error('[ServiceStateService] DELETE error:', err);
      }
    });
  }

  setServicesFromLogin(servicios: ServicioData[]): void {
    if (!servicios || servicios.length === 0) {
      this.saveAndEmit([]);
    } else {
      const valid = servicios.filter(s => !isEmptyService(s));
      this.saveAndEmit(valid);
    }
  }

  // Mètode per obtenir un servei pel seu ID
  getServicioById(id: number): Observable<ServicioData | undefined> {
    return this.service$.pipe(
      map(servicios => {
        console.log('Serveis disponibles:', servicios); // Verifica els serveis carregats
        return servicios.find(servicio => servicio.idServicio === id);
      })
    );
  }

  // Mètode per carregar serveis des de l'API i actualitzar l'estat
  loadServicios(): void {
    this.apiService.getServicios().subscribe(servicios => {
      this.serviceSubject.next(servicios); // Actualitza l'estat amb els serveis carregats
    });
  }
}

