import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresarioData } from '../models/empresario.interface';
import { AutonomoData } from '../models/autonomo.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private empresarioUrl = `${environment.authUrl}/empresas`;
  private autonomoUrl = `${environment.authUrl}/autonomos`;

  constructor(private http: HttpClient) {}

  getEmpresario(): Observable<EmpresarioData> {
    return this.http.get<EmpresarioData>(this.empresarioUrl);
  }

  updateEmpresario(payload: Partial<EmpresarioData>): Observable<EmpresarioData> {
    return this.http.put<EmpresarioData>(this.empresarioUrl, payload);
  }

  getAutonomo(): Observable<AutonomoData> {
    return this.http.get<AutonomoData>(this.autonomoUrl);
  }

  updateAutonomo(payload: Partial<AutonomoData>): Observable<AutonomoData> {
    return this.http.put<AutonomoData>(this.autonomoUrl, payload);
  }
}
