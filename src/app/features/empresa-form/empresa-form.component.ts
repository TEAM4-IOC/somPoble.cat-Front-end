import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EnterpriseStateService } from '../../core/services/enterprise-state.service';
import { CreateEmpresaPayload } from '../../core/models/create-empresa-payload.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EmpresaData } from '../../core/models/EmpresaData.interface';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './empresa-form.component.html',
  styleUrls: ['./empresa-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  imageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageError = '';
  editingKey: string | null = null;
  tempValue = '';
  userIdent = '';

  constructor(private enterpriseState: EnterpriseStateService) {}

  ngOnInit(): void {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        this.userIdent = session.usuario?.dni ?? '';
      } catch {}
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

  onFileSelected(event: Event): void {
    this.imageError = '';
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.imageFile = null;
      this.imagePreviewUrl = null;
      return;
    }
    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.imageError = 'Solo se permiten JPG o PNG.';
      this.imageFile = null;
      this.imagePreviewUrl = null;
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'El tamaño máximo es 5 MB.';
      this.imageFile = null;
      this.imagePreviewUrl = null;
      return;
    }
    this.imageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  onSubmit(): void {
    if (!this.selectedRole) {
      this.formError = 'No se ha seleccionado un rol.';
      return;
    }
    if (this.imageError) {
      return;
    }
    this.formError = '';
    const payload: CreateEmpresaPayload = {
      empresa: {
        identificadorFiscal: this.identificadorFiscal,
        direccion: this.direccion,
        email: this.email,
        telefono: this.telefono,
        imagen: this.imageFile ?? undefined,
      },
      dni: this.userIdent,
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
    if (field === 'imagen') {
      this.imageError = '';
      this.imageFile = null;
      this.imagePreviewUrl = currentValue ?? null;
    }
  }

  confirmEditing(field: string): void {
    if (field === 'imagen') {
      if (!this.imageFile) {
        this.imageError = 'Por favor selecciona una imagen.';
        return;
      }
      this.enterpriseState.updateEnterpriseField({ imagen: this.imageFile });
    } else {
      this.enterpriseState.updateEnterpriseField({
        [field]: this.tempValue,
      } as Partial<CreateEmpresaPayload['empresa']>);
    }
    this.cancelEditing();
  }

  cancelEditing(): void {
    this.editingKey = null;
    this.tempValue = '';
    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.imageError = '';
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
    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.imageError = '';
    this.formError = '';
  }
}
