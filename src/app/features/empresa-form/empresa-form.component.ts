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
  selectedRole: number | null = null;
  identificadorFiscal = '';
  direccion = '';
  email = '';
  telefono = '';
  associatedDni = '';
  nombre = '';
  actividad = '';
  formError = '';

  selectRole(role: number): void {
    this.selectedRole = role;
    this.showForm = true;
    this.identificadorFiscal = '';
    this.direccion = '';
    this.email = '';
    this.telefono = '';
    this.associatedDni = '';
    this.nombre = '';
    this.actividad = '';
  }

  onSubmit(): void {
    if (this.selectedRole === 1) {
      const empresarioData = {
        identificadorFiscal: this.identificadorFiscal,
        nombre: this.nombre,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        dniAsociado: this.associatedDni
      };
      console.log('Empresari Data:', empresarioData);
    } else if (this.selectedRole === 2) {
      const autonomoData = {
        identificadorFiscal: this.identificadorFiscal,
        actividad: this.actividad,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        dniAsociado: this.associatedDni
      };
      console.log('Autònom Data:', autonomoData);
    } else {
      this.formError = 'No s’ha seleccionat cap rol.';
    }
  }
}
