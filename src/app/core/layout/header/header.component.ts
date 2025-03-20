import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SessionService } from '../../../core/services/session.service';

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

  constructor(
    private i18nService: I18nService,
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sessionService.session$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.checkSession();
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
    this.sessionService.logout();
    this.cdr.markForCheck();
    this.router.navigate(['/login']);
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
  }
}
