import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth.interface';
import { LoginRequest } from '../models/login.interface';
import { RegisterRequest } from '../models/register.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly authUrl: string = environment.authUrl;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    const params = new HttpParams({ fromObject: payload as any });
    return this.http.get<AuthResponse>(`${this.authUrl}/login`, { params });
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
}
