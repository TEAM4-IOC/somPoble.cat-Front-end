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
import { Routing } from '../../models/routing.interface';

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

  readonly menu = computed<Routing[]>(() => {
    if (!this.isLoggedIn()) return [];
  
    if (this.userType() === 1) {
      return [
        { id: 'personal_space', label: 'menu.personal_space', route: '/espai-client' },
        { id: 'bookings', label: 'menu.bookings', route: '/gestor-reserves-cli' },
        { id: 'show_services', label: 'menu.show_services', route: '/show-services' }
      ];
    }
  
    if (this.userType() === 2) {
      return [
        {
          id: 'edit',
          label: 'espai_client.edit',
          route: '',
          subMenu: [
            { id: 'edit_profile', label: 'menu.edit_profile', route: '/edit' },
            { id: 'edit_business_profile', label: 'menu.edit_bussiness_profile', route: '/empresa-form' }
          ]
        },
        {
          id: 'show_services',
          label: 'showServices.title',
          route: '',
          subMenu: [
            { id: 'create_service', label: 'menu.create_service', route: '/services-form' },
            { id: 'show_my_services', label: 'menu.show_my_services', route: '/horaris-empresa', queryParams: { view: 'cards' } },
            { id: 'show_my_services', label: 'horaris-empresa.services-calendar', route: '/horaris-empresa', queryParams: { view: 'monthly' } }
          ]
        },
        { id: 'bookings_table', label: 'menu.bookings', route: '/horaris-empresa', queryParams: { view: 'table' } }
      ];
    }
  
    return [];
  });

  readonly mobileMenu = computed<Routing[]>(() => {
    if (!this.isLoggedIn()) return [];
  
    if (this.userType() === 1) {
      return [
        { id: 'personal_space', label: 'menu.personal_space', route: '/espai-client' },
        { id: 'bookings', label: 'menu.bookings', route: '/gestor-reserves-cli' },
        { id: 'show_services', label: 'menu.show_services', route: '/show-services' }
      ];
    }
  
    if (this.userType() === 2) {
      return [
        { id: 'edit_title', label: 'Editar', isTitle: true },
        { id: 'edit_profile', label: 'menu.edit_profile', route: '/edit' },
        { id: 'edit_business_profile', label: 'menu.edit_bussiness_profile', route: '/empresa-form' },
        { id: 'edit_title', label: 'showServices.title', isTitle: true },
        { id: 'create_service', label: 'menu.create_service', route: '/services-form' },
        { id: 'show_my_services', label: 'menu.show_my_services', route: '/horaris-empresa', queryParams: { view: 'cards' } },
        { id: 'edit_title', label: 'menu.bookings', isTitle: true },
        { id: 'bookings_table', label: 'menu.bookings', route: '/horaris-empresa', queryParams: { view: 'table' } }
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
  }

  private readSession(): void {
    const data = localStorage.getItem('session');
    if (data) {
      try {
        const session = JSON.parse(data);
  
        this.userType.set(session.tipoUsuario ?? null);
  
        if (session.tipoUsuario === 2 && session.usuario?.empresas?.length) {
          this.companyType.set(session.usuario.empresas[0].tipo ?? null);
        } else {
          this.companyType.set(null);
        }
      } catch (error) {
        this.userType.set(null);
        this.companyType.set(null);
      }
    } else {
      this.userType.set(null);
      this.companyType.set(null);
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

  toggleSubMenu(item: any): void {
    this.menu().forEach((menuItem) => {
      if (menuItem !== item && menuItem.isSubMenuOpen) {
        menuItem.isSubMenuOpen = false;
      }
    });

    item.isSubMenuOpen = !item.isSubMenuOpen;
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

    if (!target.closest('.dropdown')) {
      this.closeAllSubMenus();
    }
  }

  navigateToLanding(): void {
    this.router.navigate(['/landing']);
  }

  closeAllSubMenus(): void {
    this.menu().forEach((item) => {
      if (item.isSubMenuOpen) {
        item.isSubMenuOpen = false;
      }
    });
  }

  navigateToEspaiEmpresa(): void {
    this.router.navigate(['/espai-empresa']);
  }
}
