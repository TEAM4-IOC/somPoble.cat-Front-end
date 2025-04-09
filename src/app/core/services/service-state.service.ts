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
      next: (servicios: ServicioData[]) => {
        console.log('[ServiceStateService] GET servicios success:', servicios);
        const empresaServices = servicios.filter(s => s.empresaId === empresaId);
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

  loadServiciosByIdentificadorFiscal(identificadorFiscal: string): void {
    this.apiService.getServiciosByIdentificadorFiscal(identificadorFiscal).subscribe({
      next: (servicios: ServicioData[]) => {
        if (servicios.length > 0) {
          console.log('[ServiceStateService] Servicios encontrados:', servicios);
          this.saveAndEmit(servicios); // Actualizamos el estado local
        } else {
          console.warn('[ServiceStateService] No se encontraron servicios para el identificador fiscal:', identificadorFiscal);
          this.saveAndEmit([]); // Emitimos un array vacío si no hay servicios
        }
      },
      error: (err: any) => {
        console.error('[ServiceStateService] Error al obtener servicios:', err);
        this.saveAndEmit([]); // Emitimos un array vacío en caso de error
      }
    });
  }

  createService(payload: CreateServicePayload): Observable<ServicioData> {
    return this.apiService.createServicio(payload);
  }

  updateService(idServicio: number, payload: any, identificadorFiscal: string): Observable<any> {
    return this.apiService.updateServicio(idServicio, identificadorFiscal, payload);
  }

  deleteServicio(idServicio: number, identificadorFiscal: string): void {
    this.apiService.deleteServicio(idServicio, identificadorFiscal).subscribe({
      next: () => {
        console.log(`Servicio con ID ${idServicio} eliminado correctamente.`);
        this.loadServicios(); // Recargar la lista de servicios después de eliminar
      },
      error: (err) => {
        console.error(`Error al eliminar el servicio con ID ${idServicio}:`, err);
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
  getServicioHorarioById(identificadorFiscal: string, idServicio: number): Observable<ServicioData> {
    return this.apiService.getServicioById(identificadorFiscal, idServicio);
  }
}
