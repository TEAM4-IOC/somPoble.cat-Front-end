import { Component, OnInit } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [NgxSpinnerModule, TranslateModule, RouterModule],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss'
})
export class CookiesComponent implements OnInit {
  constructor(public loadingService: LoadingService) {}

  ngOnInit() {
    this.loadingService.loading();

    setTimeout(() => {
      this.loadingService.idle();
    },100);
  }
}
