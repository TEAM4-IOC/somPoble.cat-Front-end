import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Routing } from '../../core/models/routing.interface';

@Component({
  selector: 'app-espai-empresa',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './espai-empresa.component.html',
  styleUrls: ['./espai-empresa.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EspaiEmpresaComponent {
  private router = inject(Router);

  cards = signal<Routing[]>([
    { label: 'menu.edit_profile', route: '/edit' },
    { label: 'menu.edit_bussiness_profile', route: '/empresa-form' },
    { label: 'menu.create_service', route: '/services-form' },
    { label: 'menu.show_my_services', route: '/horaris-empresa', queryParams: { view: 'monthly' } },
    { label: 'menu.show_reservations', route: '/horaris-empresa', queryParams: { view: 'table' } }
  ]);

  goTo(route: string, queryParams: any): void {
    this.router.navigate([route], { queryParams });
  }
}