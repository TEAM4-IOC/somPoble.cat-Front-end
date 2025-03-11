import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  dni: string = '';
  nombre: string = '';
  apellidos: string = '';
  email: string = '';
  telefono: string = '';
  password: string = '';
  repeatPassword: string = '';
  showPassword: boolean = false;
  registerError: string = '';

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onRegister(): void {
    if (this.password !== this.repeatPassword) {
      this.registerError = "Las contraseñas no coinciden.";
      return;
    }
    if (this.dni && this.nombre && this.apellidos && this.email && this.telefono && this.password && this.repeatPassword) {
      this.registerError = '';
      console.log({
        dni: this.dni,
        nombre: this.nombre,
        apellidos: this.apellidos,
        email: this.email,
        telefono: this.telefono,
        password: this.password
      });
      alert('Registro exitoso');
    } else {
      this.registerError = 'Faltan datos';
    }
  }
}
