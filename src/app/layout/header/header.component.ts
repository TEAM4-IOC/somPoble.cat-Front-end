import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements AfterViewInit {
  language: string | null = localStorage.getItem('language');
  isMenuOpen = false;

  constructor(private i18nService: I18nService) {}

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
        setTimeout(() => {
          if (this.language) {
            this.i18nService.changeLanguage(this.language);
            langSelector.classList.add("d-none");
            langBtn.classList.remove("active"); 
          }
        }, 0);
      });
    }

    if (langCat) {
      langCat.addEventListener("click", () => {
        this.language = "cat";
        setTimeout(() => {
          if (this.language) {
            this.i18nService.changeLanguage(this.language);
            langSelector.classList.add("d-none");
            langBtn.classList.remove("active"); 
          }
        }, 0);
      });
    }
  }
}
