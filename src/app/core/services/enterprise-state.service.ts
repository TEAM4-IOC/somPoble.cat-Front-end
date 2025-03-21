import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EmpresaData } from '../models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../models/create-empresa-payload.interface';

function isEmptyEnterprise(empresa: EmpresaData): boolean {
  if (!empresa || !empresa.identificadorFiscal || empresa.identificadorFiscal.trim() === '') {
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
  private enterpriseSubject: BehaviorSubject<EmpresaData[]>;
  public enterprise$: Observable<EmpresaData[]>;

  constructor(private apiService: ApiService) {
    this.enterpriseSubject = new BehaviorSubject<EmpresaData[]>([]);
    this.enterprise$ = this.enterpriseSubject.asObservable();
  }

  private saveAndEmit(enterprises: EmpresaData[]): void {
    this.enterpriseSubject.next(enterprises);
  }

  public getEnterprisesValue(): EmpresaData[] {
    return this.enterpriseSubject.getValue();
  }

  loadEnterpriseFromEmpresariosByUserDni(userDni: string): void {
    console.log('[EnterpriseStateService] loadEnterpriseFromEmpresariosByUserDni =>', userDni);
    this.apiService.getEmpresarios().subscribe({
      next: (empresarios: any[]) => {
        console.log('[EnterpriseStateService] GET empresarios success:', empresarios);
        const empresario = empresarios.find(e => e.dni === userDni);
        if (empresario && empresario.empresas && empresario.empresas.length > 0) {
          const validEmpresa = empresario.empresas.find((e: EmpresaData) => e.identificadorFiscal && e.identificadorFiscal.trim() !== '');
          if (validEmpresa) {
            this.saveAndEmit([validEmpresa]);
            console.log('[EnterpriseStateService] Empresa encontrada:', validEmpresa);
            return;
          }
        }
        console.warn('[EnterpriseStateService] No se encontró empresa válida para el DNI:', userDni);
        this.saveAndEmit([]);
      },
      error: (err: any) => {
        console.error('[EnterpriseStateService] GET empresarios error:', err);
        this.saveAndEmit([]);
      }
    });
  }

  createEnterprise(payload: CreateEmpresaPayload, userDni: string): void {
    console.log('[EnterpriseStateService] createEnterprise => payload:', payload);
    this.apiService.createEmpresa(payload).subscribe({
      next: (created) => {
        console.log('[EnterpriseStateService] POST success => updating state...');
        if (created && !isEmptyEnterprise(created)) {
          this.saveAndEmit([created]);
        } else {
          console.warn('[EnterpriseStateService] POST devolvió datos nulos o inválidos, recargando...');
          this.loadEnterpriseFromEmpresariosByUserDni(userDni);
        }
      },
      error: (err) => {
        console.error('[EnterpriseStateService] POST error:', err);
      }
    });
  }

  updateEnterpriseField(partial: Partial<EmpresaData>): void {
    const current = this.getEnterprisesValue();
    if (current.length > 0) {
      const fiscalId = current[0].identificadorFiscal;
      console.log('[EnterpriseStateService] updateEnterpriseField using fiscalId =>', fiscalId, 'partial:', partial);
      this.apiService.updateEmpresa(fiscalId, partial).subscribe({
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
    } else {
      console.warn('[EnterpriseStateService] No enterprise available to update');
    }
  }

  deleteEnterprise(): void {
    const current = this.getEnterprisesValue();
    if (current.length > 0) {
      const fiscalId = current[0].identificadorFiscal;
      console.log('[EnterpriseStateService] deleteEnterprise using fiscalId =>', fiscalId);
      this.apiService.deleteEmpresa(fiscalId).subscribe({
        next: () => {
          console.log('[EnterpriseStateService] DELETE success => array empty');
          this.saveAndEmit([]);
        },
        error: (err) => {
          console.error('[EnterpriseStateService] DELETE error:', err);
        }
      });
    } else {
      console.warn('[EnterpriseStateService] No enterprise available to delete');
    }
  }

  setEnterprisesFromLogin(empresas: EmpresaData[]): void {
    if (!empresas || empresas.length === 0) {
      this.saveAndEmit([]);
    } else {
      const valid = empresas.filter(e => !isEmptyEnterprise(e));
      this.saveAndEmit(valid);
    }
  }
}
