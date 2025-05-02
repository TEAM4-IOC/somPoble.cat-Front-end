import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ServicioData } from '../models/ServicioData.interface';
import { CreateServicePayload } from '../models/create-service-payload.interface';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

function isEmptyService(servicio: ServicioData): boolean {
  return !servicio || !servicio.nombre || servicio.nombre.trim() === '';
}

@Injectable({
  providedIn: 'root'
})
export class ServiceStateService {

  private readonly mockServiciosUrl = '/assets/mock-servicios.json';
  private serviceSubject: BehaviorSubject<ServicioData[]>;
  public service$: Observable<ServicioData[]>;

  private deletionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public deletion$: Observable<boolean> = this.deletionSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.serviceSubject = new BehaviorSubject<ServicioData[]>([]);
    this.service$ = this.serviceSubject.asObservable();
  }

  public saveAndEmit(services: ServicioData[]): void {
    this.serviceSubject.next(services);
  }

  public getServicesValue(): ServicioData[] {
    return this.serviceSubject.getValue();
  }

  loadServiciosByEmpresaId(empresaId: number): void {
    this.apiService.getServicios().subscribe({
      next: (servicios: ServicioData[]) => {
        const empresaServices = servicios.filter(s => s.empresaId === empresaId);
        if (empresaServices.length > 0) {
          this.saveAndEmit(empresaServices);
        } else {
          this.saveAndEmit([]);
        }
      },
      error: (err: any) => {
        this.saveAndEmit([]);
      }
    });
  }

  loadServiciosByIdentificadorFiscal(identificadorFiscal: string): void {
    this.saveAndEmit([]);
    this.apiService.getServiciosByIdentificadorFiscal(identificadorFiscal).subscribe({
      next: (servicios: ServicioData[]) => {
        if (servicios.length > 0) {
          this.saveAndEmit(servicios);
        } else {
          this.saveAndEmit([]);
        }
      },
      error: (err: any) => {
        this.saveAndEmit([]);
      }
    });
  }

  createService(payload: CreateServicePayload): Observable<ServicioData> {
    return this.apiService.createServicio(payload);
  }

  updateService(idServicio: number, payload: any, identificadorFiscal: string): Observable<any> {
    return this.apiService.updateServicio(idServicio, identificadorFiscal, payload);
  }

  deleteServicio(idServicio: number, identificadorFiscal: string): Observable<void> {
    return this.apiService.deleteServicio(idServicio, identificadorFiscal).pipe(
      map(() => {
        const serviciosActuales = this.getServicesValue();
        const serviciosActualizados = serviciosActuales.filter(s => s.idServicio !== idServicio);
        this.saveAndEmit(serviciosActualizados);
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  setServicesFromLogin(servicios: ServicioData[]): void {
    if (!servicios || servicios.length === 0) {
      this.saveAndEmit([]);
    } else {
      const valid = servicios.filter(s => !isEmptyService(s));
      this.saveAndEmit(valid);
    }
  }

  getServicioById(id: number): Observable<ServicioData | undefined> {
    return this.service$.pipe(
      map(servicios => {
        return servicios.find(servicio => servicio.idServicio === id);
      })
    );
  }

  loadServicios(): void {
    this.apiService.getServicios().subscribe(servicios => {
      this.serviceSubject.next(servicios);
    });
  }
  getServicioHorarioById(identificadorFiscal: string, idServicio: number): Observable<ServicioData> {
    return this.apiService.getServicioById(identificadorFiscal, idServicio);
  }
}
