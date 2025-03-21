import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionSubject = new BehaviorSubject<boolean>(this.hasSession());
  session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient) {}

  private hasSession(): boolean {
    return !!localStorage.getItem('session');
  }

  updateSession(): void {
    this.sessionSubject.next(this.hasSession());
  }

  logout(): void {
    localStorage.removeItem('session');
    this.sessionSubject.next(false);
  }

  // Corrección: Extraer el tipo desde response.usuario.tipo
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${environment.authUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.usuario) {
          const sessionData = {
            tipoUsuario: response.usuario.tipo, // Aquí obtenemos el tipo correctamente
            usuario: response.usuario
          };
          localStorage.setItem('session', JSON.stringify(sessionData)); 
          this.sessionSubject.next(true);
        }
      })
    );
  }
}
