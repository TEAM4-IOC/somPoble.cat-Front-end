import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserHomeComponent {

}
