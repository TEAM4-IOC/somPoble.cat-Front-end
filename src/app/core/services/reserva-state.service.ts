import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservaStateService {
  private reservasSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public reservas$: Observable<any[]> = this.reservasSubject.asObservable();

  constructor(private apiService: ApiService) {}

  
  createReserva(payload: any): Observable<any> {
    return this.apiService.createReserva(payload);
  }

  getReservasByEmpresa(identificadorFiscal: string): Observable<any[]> {
    return this.apiService.getReservasByEmpresa(identificadorFiscal).pipe(
      catchError((error) => {
        if (error.status === 404) {
          console.warn(`No se encontraron reservas para la empresa con identificador fiscal: ${identificadorFiscal}`);
          return of([]); 
        } else {
          console.error('Error al obtener reservas:', error);
          return throwError(() => new Error('No se pudieron cargar las reservas. Inténtalo de nuevo más tarde.'));
        }
      })
    );
  }

  
  getReservasByCliente(dni: string): Observable<any[]> {
    return this.apiService.getReservasByCliente(dni);
  }

  deleteReserva(idReserva: number): Observable<void> {
    return this.apiService.deleteReserva(idReserva).pipe(
      tap(() => {
        
        const reservasActuals = this.reservasSubject.getValue();
        const novesReservas = reservasActuals.filter((reserva) => reserva.idReserva !== idReserva);
        this.reservasSubject.next(novesReservas);
      })
    );
  }

  updateReserva(idReserva: number, payload: any): Observable<any> {
    return this.apiService.updateReserva(idReserva, payload);
  }

  getReservaById(idReserva: number): Observable<any> {
    return this.apiService.getReservaById(idReserva);
  }

  loadReservasByEmpresa(identificadorFiscal: string): void {
    this.getReservasByEmpresa(identificadorFiscal).subscribe({
      next: (reservas) => {
        this.reservasSubject.next(reservas);
      },
      error: (err) => {
        this.reservasSubject.next([]);
      },
    });
  }
}