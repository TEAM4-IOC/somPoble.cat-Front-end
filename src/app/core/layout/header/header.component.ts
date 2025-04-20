import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { EnterpriseStateService } from '../../../core/services/enterprise-state.service';

export interface MenuItem {
  label: string;
  route: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly i18nService = inject(I18nService);
  private readonly authService = inject(AuthService);
  private readonly enterpriseStateService = inject(EnterpriseStateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  readonly language = signal(localStorage.getItem('language') ?? 'es');
  readonly isMenuOpen = signal(false);
  readonly showLangSelector = signal(false);

  readonly isLoggedIn = signal(false);
  readonly userType = signal<number | null>(null);
  readonly companyType = signal<number | null>(null);

  readonly menu = computed<MenuItem[]>(() => {
    if (!this.isLoggedIn()) return [];

    if (this.userType() === 1) {
      return [
        { label: 'menu.personal_space', route: '/edit' },
        { label: 'menu.bookings', route: '/reserves-cli' },
        { label: 'menu.show_services', route: '/show-services' }
      ];
    }

    if (this.userType() === 2) {
      return [
        { label: 'menu.personal_space', route: '/edit' },
        { label: 'menu.create_company', route: '/empresa-form' },
        { label: 'menu.create_services', route: '/services-form' },
        { label: 'menu.edit_services', route: '/editar-reserva' }
      ];
    }

    return [];
  });


  constructor() {
    this.authService.session$.subscribe((logged) => {
      this.isLoggedIn.set(logged);
      this.readSession();
      this.cdr.markForCheck();
    });
    this.enterpriseStateService.enterprise$.subscribe((companies) => {
      this.companyType.set(companies.length ? companies[0].tipo ?? null : null);
      this.cdr.markForCheck();
    });
  }

  private readSession(): void {
    const data = localStorage.getItem('session');
    if (data) {
      try {
        const session = JSON.parse(data);
        this.userType.set(session.tipoUsuario ?? null);
      } catch {
        this.userType.set(null);
      }
    } else {
      this.userType.set(null);
    }
  }

  changeLanguage(lang: string): void {
    this.language.set(lang);
    localStorage.setItem('language', lang);
    this.i18nService.changeLanguage(lang);
    this.showLangSelector.set(false);
  }

  toggleMenu(event?: Event): void {
    event?.stopPropagation();
    this.isMenuOpen.update((v) => !v);
  }

  toggleLangSelector(event: Event): void {
    event.stopPropagation();
    this.showLangSelector.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.closeMenu();
    this.router.navigate(['/landing']);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-wrapper') && !target.closest('.lang-btn-container')) {
      this.closeMenu();
      this.showLangSelector.set(false);
    }
  }

  navigateToLanding(): void {
    this.router.navigate(['/landing']);
  }
}
