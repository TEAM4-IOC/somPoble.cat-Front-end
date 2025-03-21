import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {
  language: string = localStorage.getItem('language') || 'es'; 
  isMenuOpen = false;

  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    const langBtn = document.querySelector(".lang-btn") as HTMLElement;
    const langSelector = document.querySelector(".lang-selector") as HTMLElement;
    const langEs = document.getElementById("lang-es");
    const langCat = document.getElementById("lang-cat");
    const menuButton = document.querySelector(".hamburger") as HTMLElement;
    const menu = document.getElementById("menu") as HTMLElement;

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
        this.cdr.detectChanges(); 
        langSelector.classList.add("d-none");
        langBtn.classList.remove("active"); 
      });
    }

    if (langCat) {
      langCat.addEventListener("click", () => {
        this.language = "cat";
        localStorage.setItem('language', this.language);
        this.i18nService.changeLanguage(this.language);
        this.cdr.detectChanges(); 
        langSelector.classList.add("d-none");
        langBtn.classList.remove("active"); 
      });
    }

    if (menuButton && menu) {
      menuButton.addEventListener("click", () => {
        this.isMenuOpen = !this.isMenuOpen;
        menu.style.display = this.isMenuOpen ? "block" : "none";
      });
    }
  }
}
