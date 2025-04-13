import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReservaStateService {
  private reservasSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public reservas$: Observable<any[]> = this.reservasSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Crear una nova reserva
  createReserva(payload: any): Observable<any> {
    return this.apiService.createReserva(payload);
  }

  getReservasByEmpresa(identificadorFiscal: string): Observable<any[]> {
    return this.apiService.getReservasByEmpresa(identificadorFiscal);
  }

  // Obtenir reserves per client (DNI)
  getReservasByCliente(dni: string): Observable<any[]> {
    return this.apiService.getReservasByCliente(dni);
  }

  deleteReserva(idReserva: number): Observable<void> {
    return this.apiService.deleteReserva(idReserva).pipe(
      tap(() => {
        console.log(`Reserva amb ID ${idReserva} eliminada correctament.`);
        // Opcional: Actualitzar l'estat local si cal
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
}