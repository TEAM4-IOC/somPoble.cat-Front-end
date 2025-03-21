import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { ApiService } from '../../core/services/api.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmpresaData } from '../../core/models/EmpresaData.interface';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NgxSpinnerModule, TranslateModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit {
  empresa1: EmpresaData | null = null;
  empresa2: EmpresaData | null = null;

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
      next: (data: EmpresaData[]) => {  // ✅ Se tipificó correctamente 'data'
        if (data.length > 0) {
          this.empresa1 = data[0];
          this.empresa2 = data.length > 1 ? data[1] : null;
          this.cdr.detectChanges();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener los datos:', error.message);
      },
      complete: () => {
        setTimeout(() => this.loadingService.idle(), 0);
      }
    });
  }
}
