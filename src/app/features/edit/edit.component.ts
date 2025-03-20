import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpdateProfileRequest } from '../../core/models/update-profile.interface';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  profile: UpdateProfileRequest = {
    dni: '',
    nombre: '',
    apellidos: '',
    email: '',
    telefono: ''
  };
  role: number = 1;
  editingFieldName: string | null = null;
  tempValue: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private translate: TranslateService) {}

  ngOnInit(): void {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const user = session.usuario;
        if (user) {
          this.role = session.tipoUsuario || 1;
          this.profile = {
            dni: user.dni,
            nombre: user.nombre,
            apellidos: user.apellidos,
            email: user.email,
            telefono: user.telefono
          };
        }
      } catch (error) {
        console.error('Error al parsear la sesión:', error);
      }
    }
  }

  startEditing(field: string, currentValue: string): void {
    if (field === 'dni') return;
    this.editingFieldName = field;
    this.tempValue = currentValue;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEditing(): void {
    this.editingFieldName = null;
    this.tempValue = '';
  }

  confirmEditing(field: string): void {
    const payload: UpdateProfileRequest = {
      dni: this.profile.dni,
      nombre: field === 'nombre' ? this.tempValue : this.profile.nombre,
      apellidos: field === 'apellidos' ? this.tempValue : this.profile.apellidos,
      email: field === 'email' ? this.tempValue : this.profile.email,
      telefono: field === 'telefono' ? this.tempValue : this.profile.telefono
    };
    this.authService.updateProfile(payload, this.role).subscribe({
      next: () => {
        if (field === 'nombre') {
          this.profile.nombre = this.tempValue;
        } else if (field === 'apellidos') {
          this.profile.apellidos = this.tempValue;
        } else if (field === 'email') {
          this.profile.email = this.tempValue;
        } else if (field === 'telefono') {
          this.profile.telefono = this.tempValue;
        }
        this.successMessage = this.translate.instant('edit_profile.update_success');
        this.errorMessage = '';
        this.editingFieldName = null;
        this.tempValue = '';
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);
        this.errorMessage = this.translate.instant('edit_profile.update_error');
        this.successMessage = '';
      }
    });
  }

  editingField(field: string): boolean {
    return this.editingFieldName === field;
  }
}
