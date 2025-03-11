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
constructor(private i18nService: I18nService) {}

  changeLanguage(lang: string) {
    this.i18nService.changeLanguage(lang);
  }
}
