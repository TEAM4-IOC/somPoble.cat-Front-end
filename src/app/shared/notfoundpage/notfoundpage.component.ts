import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-notfoundpage',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './notfoundpage.component.html',
  styleUrl: './notfoundpage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotfoundpageComponent {

}
