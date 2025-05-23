import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Routing } from '../../core/models/routing.interface';


@Component({
  selector: 'app-espai-client',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './espai-client.component.html',
  styleUrls: ['./espai-client.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EspaiClientComponent {
  private router = inject(Router);

  cards = signal<Routing[]>([
    { id: 'edit_client', label: 'espai_client.edit', route: '/edit' },
    { id: 'edit_reservation', label: 'espai_client.edit_reservation', route: '/gestor-reserves-cli' }
  ]);

  goTo(route?: string): void {
    if (!route) {
      return;
    }
    this.router.navigate([route]);
  }
}
