import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterRequest } from '../../../core/models/register.interface';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  registerRole: number | null = null;
  showForm: boolean = false;

  dni: string = '';
  nombre: string = '';
  apellidos: string = '';
  email: string = '';
  telefono: string = '';
  password: string = '';
  repeatPassword: string = '';
  showPassword: boolean = false;
  registerError: string = '';

  constructor(private authService: AuthService) {}

  selectRole(role: number): void {
    this.registerRole = role;
    console.log('Selected role ID:', this.registerRole);
    this.showForm = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister(): void {
    if (this.password !== this.repeatPassword) {
      this.registerError = 'Las contraseñas no coinciden.';
      return;
    }
    if (
      this.dni &&
      this.nombre &&
      this.apellidos &&
      this.email &&
      this.telefono &&
      this.password &&
      this.repeatPassword
    ) {
      if (this.registerRole === null) {
        this.registerError = 'Debes seleccionar un rol.';
        return;
      }
      this.registerError = '';

      const registrationData: RegisterRequest = {
        dni: this.dni,
        nombre: this.nombre,
        apellidos: this.apellidos,
        email: this.email,
        telefono: this.telefono,
        pass: this.password,
      };

      this.authService.register(registrationData, this.registerRole).subscribe({
        next: (response) => {
          console.log('Registro exitoso', response);
          alert('Registro exitoso');
        },
        error: (err) => {
          console.error('Error en el registro', err);
          this.registerError = 'Error en el registro';
        }
      });
    } else {
      this.registerError = 'Faltan datos';
    }
  }
}
