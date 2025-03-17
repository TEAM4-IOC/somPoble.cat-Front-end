import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '../../core/services/loading.service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, NgxSpinnerModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent implements OnInit {
  constructor(public loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.loading();

    setTimeout(() => {
      this.loadingService.idle();
    },0);
  }
}
