import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EnterpriseStateService } from '../../core/services/enterprise-state.service';
import { EmpresaData } from '../../core/models/EmpresaData.interface';
import { CreateEmpresaPayload } from '../../core/models/create-empresa-payload.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './empresa-form.component.html',
  styleUrls: ['./empresa-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpresaFormComponent implements OnInit {

  enterprise$!: Observable<EmpresaData[]>;

  selectedRole: number | null = null;
  formError = '';
  identificadorFiscal = '';
  direccion = '';
  email = '';
  telefono = '';
  nombre = '';
  actividad = '';

  editingKey: string | null = null;
  tempValue = '';
  userIdent = '';

  constructor(private enterpriseState: EnterpriseStateService) {}

  ngOnInit(): void {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        this.userIdent = session.usuario?.dni || '';
      } catch (err) {
        console.error('[EmpresaFormComponent] Error parseando session:', err);
      }
    }

    if (this.userIdent) {
      this.enterpriseState.loadEnterpriseFromEmpresariosByUserDni(this.userIdent);
    }

    this.enterprise$ = this.enterpriseState.enterprise$;
    this.enterprise$.subscribe((empresas) => {
      if (empresas.length === 0) {
        this.selectedRole = null;
        this.resetFormFields();
      }
    });
  }


  selectRole(role: number): void {
    this.selectedRole = role;
    this.resetFormFields();
  }

  onSubmit(): void {
    if (!this.selectedRole) {
      this.formError = 'No se ha seleccionado un rol.';
      return;
    }
    this.formError = '';

    const payload: CreateEmpresaPayload = {
      empresa: {
        identificadorFiscal: this.identificadorFiscal,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono
      },
      dni: this.userIdent
    };

    if (this.selectedRole === 1) {
      payload.empresa.nombre = this.nombre;
    } else {
      payload.empresa.actividad = this.actividad;
    }

    this.enterpriseState.createEnterprise(payload, this.userIdent);
  }

  startEditing(field: string, currentValue: string): void {
    this.editingKey = field;
    this.tempValue = currentValue;
  }

  confirmEditing(field: string): void {
    this.enterpriseState.updateEnterpriseField({ [field]: this.tempValue });
    this.editingKey = null;
    this.tempValue = '';
  }

  cancelEditing(): void {
    this.editingKey = null;
    this.tempValue = '';
  }

  deleteEnterprise(): void {
    this.enterpriseState.deleteEnterprise();
  }

  editingField(field: string): boolean {
    return this.editingKey === field;
  }

  private resetFormFields(): void {
    this.identificadorFiscal = '';
    this.direccion = '';
    this.email = '';
    this.telefono = '';
    this.nombre = '';
    this.actividad = '';
    this.formError = '';
  }
}
