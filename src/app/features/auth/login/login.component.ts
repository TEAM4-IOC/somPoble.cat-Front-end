import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  loginError: string = '';

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {

    if (this.email === 'test@test.com' && this.password === '123456') {
      this.loginError = '';
      alert('Inicio de sesión exitoso');
    } else {
      this.loginError = 'El correo o la contraseña no coinciden.';
    }
  }
}
