import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './empresa-form.component.html',
  styleUrls: ['./empresa-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmpresaFormComponent {
  showForm = false;
  showData = false;
  selectedRole: number | null = null;
  formError = '';
  editingKey: string | null = null;
  tempValue = '';
  identificadorFiscal = '';
  direccion = '';
  email = '';
  telefono = '';
  associatedDni = '';
  nombre = '';
  actividad = '';
  empresaData: any = null;

  selectRole(role: number): void {
    this.selectedRole = role;
    this.showForm = true;
    this.showData = false;
    this.resetFields();
  }

  onSubmit(): void {
    if (!this.selectedRole) {
      this.formError = 'No s’ha seleccionat cap rol.';
      return;
    }
    this.formError = '';
    if (this.selectedRole === 1) {
      const empresarioData = {
        identificadorFiscal: this.identificadorFiscal,
        nombre: this.nombre,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        dniAsociado: this.associatedDni
      };
      this.empresaData = empresarioData;
    } else if (this.selectedRole === 2) {
      const autonomoData = {
        identificadorFiscal: this.identificadorFiscal,
        actividad: this.actividad,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        dniAsociado: this.associatedDni
      };
      this.empresaData = autonomoData;
    }
    this.showForm = false;
    this.showData = true;
  }

  startEditing(field: string): void {
    this.editingKey = field;
    this.tempValue = this.empresaData[field];
  }

  confirmEditing(field: string): void {
    const partialPayload = { [field]: this.tempValue };
    this.empresaData = { ...this.empresaData, ...partialPayload };
    this.editingKey = null;
    this.tempValue = '';
  }

  cancelEditing(): void {
    this.editingKey = null;
    this.tempValue = '';
  }

  deleteAll(): void {
    this.empresaData = null;
    this.selectedRole = null;
    this.showData = false;
    this.showForm = false;
    this.resetFields();
  }

  editingField(field: string): boolean {
    return this.editingKey === field;
  }

  private resetFields(): void {
    this.identificadorFiscal = '';
    this.direccion = '';
    this.email = '';
    this.telefono = '';
    this.associatedDni = '';
    this.nombre = '';
    this.actividad = '';
    this.formError = '';
  }
}
