import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  {
    path: 'landing',
    loadComponent: () =>
      import('./features/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
  },
  {
    path: 'edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/edit/edit.component').then((m) => m.EditComponent),
  },
  {
    path: 'empresa-form',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/empresa-form/empresa-form.component').then(
        (m) => m.EmpresaFormComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./shared/policy/legal-notice/legal-notice.component').then(
        (m) => m.LegalNoticeComponent
      ),
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('../app/shared/policy/cookies/cookies.component').then(
        (m) => m.CookiesComponent
      ),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./shared/policy/privacy/privacy.component').then(
        (m) => m.PrivacyComponent
      ),
  },
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/notfoundpage/notfoundpage.component').then(
        (m) => m.NotfoundpageComponent
      ),
  },
  { path: '**', redirectTo: 'landing' },
];
