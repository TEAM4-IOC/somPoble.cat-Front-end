import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmpresaData } from '../models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../models/create-empresa-payload.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private empresaUrl = `${environment.authUrl}/empresas`;

  constructor(private http: HttpClient) {}

  getEmpresas(): Observable<EmpresaData[]> {
    return this.http.get<EmpresaData[]>(this.empresaUrl);
  }

  getEmpresaByIdentificador(identificador: string): Observable<EmpresaData> {
    return this.http.get<EmpresaData>(`${this.empresaUrl}/${identificador}`);
  }

  createEmpresa(payload: CreateEmpresaPayload): Observable<EmpresaData> {
    return this.http.post<EmpresaData>(this.empresaUrl, payload);
  }

  updateEmpresa(identificadorFiscal: string, partial: Partial<EmpresaData>): Observable<EmpresaData> {
    return this.http.put<EmpresaData>(`${this.empresaUrl}/${identificadorFiscal}`, partial);
  }

  deleteEmpresa(identificadorFiscal: string): Observable<any> {
    return this.http.delete<any>(`${this.empresaUrl}/${identificadorFiscal}`);
  }
}
