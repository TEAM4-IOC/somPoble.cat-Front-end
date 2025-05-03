import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterRequest } from '../../../core/models/register.interface';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private authService: AuthService, private router: Router, private translate: TranslateService) {}

  selectRole(role: number): void {
    this.registerRole = role;
    this.showForm = true;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister(): void {
    if (this.password !== this.repeatPassword) {
      this.registerError = this.translate.instant('register.repeat_password_mismatch');
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
        this.registerError = this.translate.instant('register.select_role_error');
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
          alert(this.translate.instant('register.registration_success'));
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en el registro', err);
          this.registerError = this.translate.instant('register.error');
        }
      });
    } else {
      this.registerError = this.translate.instant('register.missing_data');
    }
  }
}
