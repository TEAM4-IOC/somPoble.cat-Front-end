import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EmpresaData } from '../models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../models/create-empresa-payload.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private empresaUrl = `${environment.authUrl}/empresas`;

  constructor(private http: HttpClient) {}

  getEmpresaByIdentificador(fiscalId: string): Observable<EmpresaData> {
    return this.http
      .get<{ empresa: EmpresaData; dni: string }>(`${this.empresaUrl}/${fiscalId}`)
      .pipe(map(response => response.empresa));
  }

  createEmpresa(payload: CreateEmpresaPayload): Observable<EmpresaData> {
    return this.http
      .post<{ empresa: EmpresaData; dni: string }>(this.empresaUrl, payload)
      .pipe(map(response => response.empresa));
  }

  updateEmpresa(fiscalId: string, partial: Partial<EmpresaData>): Observable<EmpresaData> {
    return this.http.put(`${this.empresaUrl}/${fiscalId}`, partial, { responseType: 'text' })
      .pipe(
        switchMap(() => this.getEmpresaByIdentificador(fiscalId))
      );
  }

  deleteEmpresa(fiscalId: string): Observable<any> {
    return this.http.delete(`${this.empresaUrl}/${fiscalId}`, { responseType: 'text' });
  }

  getEmpresarios(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.authUrl}/empresarios`);
  }
}
