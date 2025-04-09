import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { empresaGuard } from './core/guards/auth.guard';

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
    path: 'services-form',
    //canActivate: [empresaGuard],
    loadComponent: () =>
      import('./features/services-form/services-form.component').then(
        (m) => m.ServicesFormComponent
      ),
  },
  {
    path: 'services-form/:id',
    //canActivate: [empresaGuard],
    loadComponent: () =>
      import('./features/services-form/services-form.component').then(
        (m) => m.ServicesFormComponent
      ),
  },
  {
    path: 'show-services',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/show-services/show-services.component').then(
        (m) => m.ShowServicesComponent
      ),
  },
  {
    path: 'service-detail/:id/:identificadorFiscal',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/component/service-detail/service-detail.component').then(
        (m) => m.ServiceDetailComponent
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
