import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private translationsLoaded$ = new BehaviorSubject<boolean>(false); // ✅ Estado reactivo para el spinner

  constructor(private translate: TranslateService) {
    this.initTranslate();
  }

  private async initTranslate(): Promise<void> {
    const lang = localStorage.getItem('language') || 'es';
    this.translate.setDefaultLang('es');

    try {
      await firstValueFrom(this.translate.use(lang)); // ✅ Espera la carga del idioma
      this.translationsLoaded$.next(true); // ✅ Marca como "cargado"
    } catch (error) {
      console.error('Error cargando las traducciones:', error);
    }
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

  getTranslationsLoaded$() {
    return this.translationsLoaded$.asObservable(); // ✅ Expone el estado del spinner como un Observable
  }
}
