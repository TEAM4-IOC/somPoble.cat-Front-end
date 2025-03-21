import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth.interface';
import { LoginRequest } from '../models/login.interface';
import { RegisterRequest } from '../models/register.interface';
import { UpdateProfileRequest } from '../models/update-profile.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authUrl: string = environment.authUrl;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload);
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
}
