import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-services',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './show-services.component.html',
  styleUrls: ['./show-services.component.scss']
})
export class ShowServicesComponent implements OnInit {
  services$: Observable<ServicioData[]>;

  constructor(private apiService: ApiService) {
    this.services$ = new Observable<ServicioData[]>();
  }

  ngOnInit(): void {
    this.services$ = this.apiService.getServicios();
  }
}
