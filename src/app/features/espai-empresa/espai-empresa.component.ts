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
    { id: 'edit_profile', label: 'menu.edit_profile', route: '/edit' },
    { id: 'edit_business_profile', label: 'menu.edit_bussiness_profile', route: '/empresa-form' },
    { id: 'create_service', label: 'menu.create_service', route: '/services-form' },
    { id: 'show_my_services', label: 'menu.show_my_services', route: '/horaris-empresa', queryParams: { view: 'cards' } },
    { id: 'show_my_services', label: 'horaris-empresa.services-calendar', route: '/horaris-empresa', queryParams: { view: 'monthly' } },
    { id: 'show_reservations', label: 'menu.show_reservations', route: '/horaris-empresa', queryParams: { view: 'table' } },
    { id: 'metricas', label: 'menu.metrics', route: '/metricas' },
  ]);

  goTo(route?: string, queryParams?: { [key: string]: any }): void {
    if (!route) {
      return;
    }
    this.router.navigate([route], { queryParams });
  }
}