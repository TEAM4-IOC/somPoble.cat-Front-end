import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ServicioData } from '../../../core/models/ServicioData.interface';
import { ServiceStateService } from '../../../core/services/service-state.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  service$!: Observable<ServicioData | undefined>;

  constructor(
    private route: ActivatedRoute,
    private serviceStateService: ServiceStateService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const identificadorFiscal = this.route.snapshot.paramMap.get('identificadorFiscal')!;
    this.service$ = this.serviceStateService.getServicioHorarioById(identificadorFiscal, id);
  }

}
