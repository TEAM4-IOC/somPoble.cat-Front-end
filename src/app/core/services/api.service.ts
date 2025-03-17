import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmpresaData } from '../models/base-empresa.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private empresaUrl = `${environment.authUrl}/empresas`;

  constructor(private http: HttpClient) {}

  getEmpresa(): Observable<EmpresaData> {
    return this.http.get<EmpresaData>(this.empresaUrl);
  }

  updateEmpresa(payload: Partial<EmpresaData>): Observable<EmpresaData> {
    return this.http.put<EmpresaData>(this.empresaUrl, payload);
  }
}
