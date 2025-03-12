import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse } from '../models/auth.interface';
import { LoginRequest } from '../models/login.interface';
import { RegisterRequest } from '../models/register.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
// hasta que no se tenga la url oficial toca dejar la estructura
  private readonly authUrl: string = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, payload);
  }
}
