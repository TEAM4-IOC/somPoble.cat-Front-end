import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { LegalNoticeComponent } from './policy/legal-notice/legal-notice.component';
import { CookiesComponent } from './policy/cookies/cookies.component';
import { PrivacyComponent } from './policy/privacy/privacy.component';
import { NotfoundpageComponent } from './features/notfoundpage/notfoundpage.component';
import { LandingPageComponent } from './layout/landing-page/landing-page.component';

export const routes: Routes = [
  { path: 'landing', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'legal-notice', component: LegalNoticeComponent },
  { path: 'cookies', component: CookiesComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'not-found', component: NotfoundpageComponent },
  { path: '**', redirectTo: 'login' },
];
