import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

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
}