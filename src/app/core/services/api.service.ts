import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EmpresaData } from '../models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../models/create-empresa-payload.interface';
import { ServicioData } from '../models/ServicioData.interface'
import { CreateServicePayload } from '../models/create-service-payload.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private empresaUrl = `${environment.authUrl}/empresas`;
  private servicioUrl = `${environment.authUrl}/servicios`;

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

  getEmpresas(): Observable<EmpresaData[]> {
    return this.http.get<EmpresaData[]>(`${environment.authUrl}/empresas`);
  }

  //Implementación servicios - A revisar cuando backend lo tenga listo
  getServiciosByIdentificadorFiscal(identificadorFiscal: string): Observable<ServicioData[]> {
    const url = `https://sompoblecatsb-production.up.railway.app/api/servicio-horario/obtener?identificadorFiscal=${identificadorFiscal}`;
    return this.http.get<ServicioData[]>(url);
  }

  createServicio(payload: CreateServicePayload): Observable<ServicioData> {
    return this.http
      .post<{ servicio: ServicioData, empresa:string }>(this.servicioUrl, payload)
      .pipe(map(response => response.servicio));
  }

  /* updateServicio(servicioId: number, partial: Partial<ServicioData>): Observable<ServicioData> {
    return this.http.put(`${this.servicioUrl}/${servicioId}`, partial, { responseType: 'text' })
      .pipe(
        switchMap(() => this.getServiciosByIdentificadorFiscal(servicioId))
      );
  } */

  deleteServicio(servicioId: number): Observable<any> {
    return this.http.delete(`${this.servicioUrl}/${servicioId}`, { responseType: 'text' });
  }

  getServicios(): Observable<ServicioData[]> {
    return this.http.get<ServicioData[]>(`${environment.authUrl}/servicio-horario/obtener-todos`);
  }

  // getServicios(): Observable<ServicioData[]> {
  //   return this.http.get<ServicioData[]>('/assets/mock-servicios.json');
  // }

}
