import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  constructor(private translate: TranslateService) {
    const lang = localStorage.getItem('language') || 'es';
    this.translate.setDefaultLang('es');
    this.translate.use(lang);
  }

  changeLanguage(lang: string) {
    if (this.translate.currentLang !== lang) {
      this.translate.use(lang);
      localStorage.setItem('language', lang);
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || 'es';
  }
}
