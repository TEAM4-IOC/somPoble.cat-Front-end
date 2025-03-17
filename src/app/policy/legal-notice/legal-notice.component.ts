import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from '../../core/services/loading.service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, NgxSpinnerModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegalNoticeComponent implements OnInit {
  constructor(public loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.loading();

    setTimeout(() => {
      this.loadingService.idle();
    },0);
  }
}