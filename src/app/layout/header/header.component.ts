import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nService } from '../../core/services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  language: string | null = localStorage.getItem('language'); isMenuOpen = false;



  constructor(private i18nService: I18nService) {
  }

  changeLanguage(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement) {
      this.language = selectElement.value;
      this.i18nService.changeLanguage(this.language);
    }


    ;
  }
}
