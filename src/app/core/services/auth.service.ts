import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from '../models/auth.interface';
import { LoginRequest } from '../models/login.interface';
import { RegisterRequest } from '../models/register.interface';
import { UpdateProfileRequest } from '../models/update-profile.interface';
import { environment } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl: string = environment.authUrl;
  private sessionSubject: BehaviorSubject<boolean>;
  public session$;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {
    this.sessionSubject = new BehaviorSubject<boolean>(this.hasSession());
    this.session$ = this.sessionSubject.asObservable();
  }

  private hasSession(): boolean {
    return !!this.localStorageService.getItem('session');
  }

  isLoggedIn(): boolean {
    return this.hasSession();
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload).pipe(
      tap((response: AuthResponse) => {
        this.localStorageService.setItem('session', response);
        this.sessionSubject.next(true);
      })
    );
  }

  register(payload: RegisterRequest, role: number): Observable<AuthResponse> {
    let endpoint = '';
    if (role === 1) {
      endpoint = `${this.authUrl}/clientes`;
    } else if (role === 2) {
      endpoint = `${this.authUrl}/empresarios`;
    }
    return this.http.post<AuthResponse>(endpoint, payload);
  }

  updateProfile(payload: UpdateProfileRequest, role: number): Observable<any> {
    let endpoint = '';
    if (role === 1) {
      endpoint = `${this.authUrl}/clientes/${payload.dni}`;
    } else if (role === 2) {
      endpoint = `${this.authUrl}/empresarios/${payload.dni}`;
    }
    return this.http.put(endpoint, payload, { responseType: 'text' });
  }

  logout(): void {
    this.localStorageService.removeItem('session');
    this.sessionSubject.next(false);
  }

  isEmpresa(): boolean {
    const session = this.localStorageService.getItem('session');
  
    if (session && typeof session === 'object' && 'tipoUsuario' in session) {
      return session.tipoUsuario === 2;
    }
  
    return false;
  }

  getEmpresaId(): number | null {
    const session = this.localStorageService.getItem('session');
  
    if (session && typeof session === 'object') {
      const sessionData = session as { usuario?: { empresas?: { idEmpresa?: number } } };
      
      return sessionData.usuario?.empresas?.idEmpresa ?? null;
    }
    
    return null;
  }
}
