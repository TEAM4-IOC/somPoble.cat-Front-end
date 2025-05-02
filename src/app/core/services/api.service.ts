import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EmpresaData } from '../models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../models/create-empresa-payload.interface';
import { ServicioData } from '../models/ServicioData.interface';
import { CreateServicePayload } from '../models/create-service-payload.interface';
import { EventData } from '../models/EventData.interface';
import { Metrics } from '../models/metrics.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private empresaUrl = `${environment.authUrl}/empresas`;
  private servicioUrl = `${environment.authUrl}/servicio`;
  private landingUrl = `${environment.authUrl}/landing`;
  private metricsUrl = `${environment.authUrl}/metricas`;

  constructor(private http: HttpClient) { }
  getLandingData(): Observable<EmpresaData[]> {
    return this.http
      .get<
        Array<{
          nombre: string;
          direccion: string;
          telefono: string;
          email: string;
          imagen: string | null;
          identificadorFiscal: string;
          servicios: ServicioData[];
        }>
      >(this.landingUrl)
      .pipe(
        map(items =>
          items.map(item => ({
            idEmpresa: 0,
            identificadorFiscal: item.identificadorFiscal,
            nombre: item.nombre,
            actividad: null,
            direccion: item.direccion,
            email: item.email,
            telefono: item.telefono,
            tipo: 0,
            fechaAlta: '',
            fechaModificacion: '',
            reservas: [],
            servicios: item.servicios,
            horarios: [],
            imagenUrl: item.imagen,
            imagenPublicId: null
          }))
        )
      );
  }  getEmpresaByIdentificador(fiscalId: string): Observable<EmpresaData> {
    return this.http
      .get<{ empresa: EmpresaData; dni: string }>(`${this.empresaUrl}/${fiscalId}`)
      .pipe(map(response => response.empresa));
  }

  createEmpresa(payload: CreateEmpresaPayload): Observable<EmpresaData> {
    const form = new FormData();
    form.append('empresa', JSON.stringify({
      identificadorFiscal: payload.empresa.identificadorFiscal,
      nombre: payload.empresa.nombre,
      actividad: payload.empresa.actividad,
      direccion: payload.empresa.direccion,
      email: payload.empresa.email,
      telefono: payload.empresa.telefono
    }));
    form.append('dni', JSON.stringify({ dni: payload.dni }));
    if (payload.empresa.imagen) {
      form.append('imagen', payload.empresa.imagen);
    }
    return this.http
      .post(this.empresaUrl, form, { responseType: 'text' })
      .pipe(switchMap(() => this.getEmpresaByIdentificador(payload.empresa.identificadorFiscal)));
  }

  updateEmpresa(
    fiscalId: string,
    partial: Partial<CreateEmpresaPayload['empresa']>
  ): Observable<EmpresaData> {
    const form = new FormData();
    form.append('empresa', JSON.stringify({
      identificadorFiscal: partial.identificadorFiscal,
      nombre: partial.nombre,
      actividad: partial.actividad,
      direccion: partial.direccion,
      email: partial.email,
      telefono: partial.telefono
    }));
    if (partial.imagen) {
      form.append('imagen', partial.imagen);
    }
    return this.http
      .put(`${this.empresaUrl}/${fiscalId}`, form, { responseType: 'text' })
      .pipe(switchMap(() => this.getEmpresaByIdentificador(fiscalId)));
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

  getServiciosByIdentificadorFiscal(identificadorFiscal: string): Observable<ServicioData[]> {
    return this.http.get<ServicioData[]>(
      `${environment.authUrl}/servicio-horario/obtener?identificadorFiscal=${identificadorFiscal}`
    );
  }

  createServicio(payload: CreateServicePayload): Observable<ServicioData> {
    return this.http
      .post<{ servicio: ServicioData; empresa: string }>(
        `${this.servicioUrl}-horario/crear`,
        payload
      )
      .pipe(map(response => response.servicio));
  }

  updateServicio(
    idServicio: number,
    identificadorFiscal: string,
    payload: any
  ): Observable<any> {
    return this.http.put(
      `${this.servicioUrl}-horario/actualizar/${idServicio}?identificadorFiscal=${identificadorFiscal}`,
      payload
    );
  }

  deleteServicio(idServicio: number, identificadorFiscal: string): Observable<void> {
    return this.http.delete<void>(
      `${this.servicioUrl}-horario/anular/${idServicio}?identificadorFiscal=${identificadorFiscal}`
    );
  }

  getServicios(): Observable<ServicioData[]> {
    return this.http.get<ServicioData[]>(`${environment.authUrl}/servicio-horario/obtener-todos`);
  }

  getServicioById(
    identificadorFiscal: string,
    idServicio: number
  ): Observable<ServicioData> {
    return this.http.get<ServicioData>(
      `${environment.authUrl}/servicio-horario/obtener-empresa-idservicio?identificadorFiscal=${identificadorFiscal}&idServicio=${idServicio}`
    );
  }

  getEventos(): Observable<EventData[]> {
    return this.http.get<EventData[]>(`${environment.authUrl}/eventos`);
  }

  getEvento(id: number): Observable<EventData> {
    return this.http.get<EventData>(`${environment.authUrl}/eventos/${id}`);
  }

  createReserva(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.authUrl}/reservas`, payload);
  }

  getReservasByCliente(dni: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.authUrl}/reservas/clientes/${dni}`);
  }

  getReservasByEmpresa(identificadorFiscal: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.authUrl}/reservas/empresas/${identificadorFiscal}`);
  }

  deleteReserva(idReserva: number): Observable<void> {
    return this.http.delete<void>(`${environment.authUrl}/reservas/${idReserva}`, {
      responseType: 'text' as 'json'
    });
  }

  updateReserva(idReserva: number, payload: any): Observable<any> {
    return this.http.put(
      `${environment.authUrl}/reservas/${idReserva}`,
      payload,
      { responseType: 'text' }
    );
  }

  getReservaById(idReserva: number): Observable<any> {
    return this.http.get<any>(`${environment.authUrl}/reservas/${idReserva}`);
  }
  public getMetrics(
    empresaIdFiscal: string,
    fechaInicio: string,
    fechaFin: string
  ): Observable<Metrics> {
    const params = new HttpParams()
      .set('empresaIdFiscal', empresaIdFiscal)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<Metrics>(this.metricsUrl, { params });
  }
}
