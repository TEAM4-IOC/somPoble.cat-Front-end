import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/login.interface';
import { AuthResponse } from '../../../core/models/auth.interface';
import { SessionService } from '../../../core/services/session.service';

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

  constructor(private authService: AuthService, private router: Router, private sessionService: SessionService) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    const payload: LoginRequest = { email: this.email, pass: this.password };
    this.authService.login(payload).subscribe({
      next: (response: AuthResponse) => {
        localStorage.setItem('session', JSON.stringify(response));
        this.sessionService.updateSession();
        this.router.navigate(['/empresa-form']);
      },
      error: () => {
        this.loginError = 'El correo o la contraseña no coinciden.';
      }
    });
  }
}
