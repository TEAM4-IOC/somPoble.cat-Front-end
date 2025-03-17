import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NgxSpinnerModule, TranslateModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  empresa: any = {};

  constructor(private cdr: ChangeDetectorRef, public loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingService.loading(); // Activa el loading

    this.fetchData();
  }

  private fetchData(): void {
    fetch('https://sompoblecatsb-production.up.railway.app/api/empresas')
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          this.empresa = data[0];
          this.cdr.detectChanges();
        }
      })
      .catch(error => console.error('Error al obtener los datos:', error))
      .finally(() => {
        setTimeout(() => {
          this.loadingService.idle();
        }, 0);
      });
  }
}