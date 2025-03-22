import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LegalNoticeComponent } from './shared/policy/legal-notice/legal-notice.component';
import { CookiesComponent } from '../app/shared/policy/cookies/cookies.component';
import { PrivacyComponent } from './shared/policy/privacy/privacy.component';
import { NotfoundpageComponent } from './shared/notfoundpage/notfoundpage.component';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { EmpresaFormComponent } from './features/empresa-form/empresa-form.component';
import { EditComponent } from './features/edit/edit.component';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: 'landing', component: LandingPageComponent, canActivate: [authGuard] },
  { path: 'edit', component: EditComponent, canActivate: [authGuard] },
  { path: 'empresa-form', component: EmpresaFormComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'legal-notice', component: LegalNoticeComponent },
  { path: 'cookies', component: CookiesComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'not-found', component: NotfoundpageComponent },
  { path: '**', redirectTo: 'login' }
];
