import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EnterpriseStateService } from '../../../core/services/enterprise-state.service'; // IMPORTANTE
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, AfterViewInit {
  language: string = localStorage.getItem('language') || 'es';
  isMenuOpen = false;
  isLoggedIn = false;
  tipoUsuario: number | null = null;
  tipoEmpresa: number | null = null;

  constructor(
    private i18nService: I18nService,
    private authService: AuthService,
    private enterpriseStateService: EnterpriseStateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.session$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.checkSession();
      this.cdr.markForCheck();
    });

    this.enterpriseStateService.enterprise$.subscribe((empresas) => {
      if (empresas.length > 0) {
        this.tipoEmpresa = empresas[0].tipo || null;
      } else {
        this.tipoEmpresa = null;
      }
      this.cdr.markForCheck();
    });
  }

  checkSession(): void {
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
      const session = JSON.parse(sessionData);
      this.tipoUsuario = session.tipoUsuario || null;
    } else {
      this.tipoUsuario = null;
    }
  }

  logout(): void {
    this.authService.logout();
    this.cdr.markForCheck();
    this.router.navigate(['/landing']);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation(); // Evita que el clic se propague y cierre el menú inmediatamente
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    const langBtn = document.querySelector(".lang-btn") as HTMLElement;
    const langSelector = document.querySelector(".lang-selector") as HTMLElement;
    const langEs = document.getElementById("lang-es");
    const langCat = document.getElementById("lang-cat");

    if (langBtn && langSelector) {
      langBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        langSelector.classList.toggle("d-none");
        langBtn.classList.toggle("active");
      });

      document.addEventListener("click", (event) => {
        if (!langBtn.contains(event.target as Node) && !langSelector.contains(event.target as Node)) {
          langSelector.classList.add("d-none");
          langBtn.classList.remove("active");
        }
      });
    }

    if (langEs) {
      langEs.addEventListener("click", () => {
        this.language = "es";
        localStorage.setItem('language', this.language);
        this.i18nService.changeLanguage(this.language);
        this.cdr.markForCheck();
      });
    }

    if (langCat) {
      langCat.addEventListener("click", () => {
        this.language = "cat";
        localStorage.setItem('language', this.language);
        this.i18nService.changeLanguage(this.language);
        this.cdr.markForCheck();
      });
    }

    document.addEventListener("click", (event) => {
      const menu = document.querySelector(".menu-container") as HTMLElement;
      const menuButton = document.querySelector(".hamburguer-menu") as HTMLElement;

      if (
        this.isMenuOpen &&
        menu &&
        menuButton &&
        !menu.contains(event.target as Node) &&
        !menuButton.contains(event.target as Node)
      ) {
        this.isMenuOpen = false;
        this.cdr.detectChanges();
      }
    });
  }
}
