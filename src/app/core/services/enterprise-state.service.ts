import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EmpresaData } from '../models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../models/create-empresa-payload.interface';
import { LocalStorageService } from './local-storage.service';

function isEmptyEnterprise(empresa: EmpresaData): boolean {
  if (!empresa.identificadorFiscal || empresa.identificadorFiscal.trim() === '') {
    return true;
  }

  if (empresa.tipo === 1 && (!empresa.nombre || empresa.nombre.trim() === '')) {
    return true;
  }
  if (empresa.tipo === 2 && (!empresa.actividad || empresa.actividad.trim() === '')) {
    return true;
  }
  return false;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseStateService {

  private readonly ENTERPRISE_KEY = 'enterpriseData';

  private enterpriseSubject: BehaviorSubject<EmpresaData[]>;

  public enterprise$: Observable<EmpresaData[]>;

  constructor(
    private apiService: ApiService,
    private ls: LocalStorageService
  ) {

    const stored = this.ls.getItem<EmpresaData[]>(this.ENTERPRISE_KEY) || [];
    this.enterpriseSubject = new BehaviorSubject<EmpresaData[]>(stored);
    this.enterprise$ = this.enterpriseSubject.asObservable();
  }


  private saveAndEmit(enterprises: EmpresaData[]): void {
    this.ls.setItem(this.ENTERPRISE_KEY, enterprises);
    this.enterpriseSubject.next(enterprises);
  }


  public getEnterprisesValue(): EmpresaData[] {
    return this.enterpriseSubject.getValue();
  }


  loadEnterpriseByIdentificador(identificador: string): void {
    console.log('[EnterpriseStateService] loadEnterpriseByIdentificador =>', identificador);
    this.apiService.getEmpresaByIdentificador(identificador).subscribe({
      next: (empresa: EmpresaData) => {
        console.log('[EnterpriseStateService] GET success => empresa:', empresa);
        if (isEmptyEnterprise(empresa)) {
          this.saveAndEmit([]);
        } else {
          this.saveAndEmit([empresa]);
        }
      },
      error: (err: any) => {
        console.error('[EnterpriseStateService] GET error => array vacío:', err);
        this.saveAndEmit([]);
      }
    });
  }

  createEnterprise(payload: CreateEmpresaPayload, identificador: string): void {
    console.log('[EnterpriseStateService] createEnterprise => payload:', payload);
    this.apiService.createEmpresa(payload).subscribe({
      next: (created) => {
        console.log('[EnterpriseStateService] POST success => recargando empresa...');
        this.loadEnterpriseByIdentificador(identificador);
      },
      error: (err) => {
        console.error('[EnterpriseStateService] POST error:', err);
      }
    });
  }

  updateEnterpriseField(identificadorFiscal: string, partial: Partial<EmpresaData>): void {
    console.log('[EnterpriseStateService] updateEnterpriseField => partial:', partial);
    this.apiService.updateEmpresa(identificadorFiscal, partial).subscribe({
      next: (updated: EmpresaData) => {
        console.log('[EnterpriseStateService] PUT success => updated:', updated);
        if (isEmptyEnterprise(updated)) {
          this.saveAndEmit([]);
        } else {
          this.saveAndEmit([updated]);
        }
      },
      error: (err) => {
        console.error('[EnterpriseStateService] PUT error:', err);
      }
    });
  }

  deleteEnterprise(identificadorFiscal: string): void {
    console.log('[EnterpriseStateService] deleteEnterprise =>', identificadorFiscal);
    this.apiService.deleteEmpresa(identificadorFiscal).subscribe({
      next: () => {
        console.log('[EnterpriseStateService] DELETE success => array vacío');
        this.saveAndEmit([]);
      },
      error: (err) => {
        console.error('[EnterpriseStateService] DELETE error:', err);
      }
    });
  }

  setEnterprisesFromLogin(empresas: EmpresaData[]): void {
    if (!empresas || empresas.length === 0) {
      this.saveAndEmit([]);
    } else {
      const validas = empresas.filter(e => !isEmptyEnterprise(e));
      this.saveAndEmit(validas);
    }
  }
}
