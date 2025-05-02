import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
  private enterpriseSubject = new BehaviorSubject<EmpresaData[]>([]);
  public enterprise$ = this.enterpriseSubject.asObservable();

  private deletionSubject = new BehaviorSubject<boolean>(false);
  public deletion$ = this.deletionSubject.asObservable();

  constructor(private apiService: ApiService) {}

  private saveAndEmit(enterprises: EmpresaData[]): void {
    this.enterpriseSubject.next(enterprises);
  }

  public getEnterprisesValue(): EmpresaData[] {
    return this.enterpriseSubject.getValue();
  }

  loadEnterpriseFromEmpresariosByUserDni(userDni: string): void {
    this.apiService.getEmpresarios().pipe(
      switchMap((empresarios: any[]) => {
        const empresario = empresarios.find(e => e.dni === userDni);
        if (empresario?.empresas?.length) {
          const validEmpresa = (empresario.empresas as EmpresaData[])
            .find(e => e.identificadorFiscal?.trim());
          if (validEmpresa) {
            return this.apiService.getEmpresaByIdentificador(validEmpresa.identificadorFiscal);
          }
        }
        console.warn('[EnterpriseStateService] No se encontró empresa válida para el DNI:', userDni);
        this.saveAndEmit([]);
        throw new Error('No valid enterprise');
      })
    ).subscribe({
      next: (detalle: EmpresaData) => {
        this.saveAndEmit([detalle]);
      },
      error: (err) => {
        if (err.message !== 'No valid enterprise') {
        }
      }
    });
  }

  createEnterprise(payload: CreateEmpresaPayload, userDni: string): void {
    this.apiService.createEmpresa(payload).subscribe({
      next: () => this.loadEnterpriseFromEmpresariosByUserDni(userDni),
      error: () => this.loadEnterpriseFromEmpresariosByUserDni(userDni)
    });
  }

  updateEnterpriseField(partial: Partial<CreateEmpresaPayload['empresa']>): void {
    const current = this.getEnterprisesValue();
    if (!current.length) {
      console.warn('[EnterpriseStateService] No enterprise available to update');
      return;
    }
    const fiscalId = current[0].identificadorFiscal;
    this.apiService.updateEmpresa(fiscalId, partial).subscribe({
      next: (updated: EmpresaData) => {
        if (isEmptyEnterprise(updated)) {
          this.saveAndEmit([]);
        } else {
          this.saveAndEmit([updated]);
        }
      },
      error: (err) => console.error('[EnterpriseStateService] PUT error:', err)
    });
  }

  deleteEnterprise(): void {
    const current = this.getEnterprisesValue();
    if (!current.length) {
      console.warn('[EnterpriseStateService] No enterprise available to delete');
      return;
    }
    const fiscalId = current[0].identificadorFiscal;
    this.apiService.deleteEmpresa(fiscalId).subscribe({
      next: () => {
        this.saveAndEmit([]);
        this.deletionSubject.next(true);
      },
      error: (err) => console.error('[EnterpriseStateService] DELETE error:', err)
    });
  }

  setEnterprisesFromLogin(empresas: EmpresaData[]): void {
    const valid = (empresas || []).filter(e => !isEmptyEnterprise(e));
    this.saveAndEmit(valid);
  }
}
