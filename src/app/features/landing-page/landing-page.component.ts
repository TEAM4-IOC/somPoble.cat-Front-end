import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { ApiService } from '../../core/services/api.service';
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
  empresa1: any = {};
  empresa2: any = {};

  constructor(
    private cdr: ChangeDetectorRef,
    public loadingService: LoadingService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadingService.loading();
    this.fetchData();
  }

  private fetchData(): void {
    this.apiService.getEmpresas().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.empresa1 = data[0];
          this.empresa2 = data.length > 1 ? data[1] : {};
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
      },
      complete: () => {
        setTimeout(() => this.loadingService.idle(), 0);
      }
    });
  }
}
