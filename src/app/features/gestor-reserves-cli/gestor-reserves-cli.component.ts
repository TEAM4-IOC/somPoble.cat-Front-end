import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-gestor-reserves-cli',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './gestor-reserves-cli.component.html',
  styleUrls: ['./gestor-reserves-cli.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestorReservesCliComponent implements OnInit {
  reservas: any[] = [];
  dniCliente: string = '';
  errorMessage: string = '';
  loading: boolean = true;

  constructor(
    private reservaStateService: ReservaStateService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadDniFromSession();
    this.loadReservas();
  }

  loadDniFromSession(): void {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const cliente = session.usuario;
        this.dniCliente = cliente?.dni || '';
      } catch (error) { }
    }
  }

  loadReservas(): void {
    this.reservaStateService.getReservasByCliente(this.dniCliente).subscribe(
      (reservas) => {
        this.reservas = reservas.map((reserva) => {
          reserva.hora = reserva.hora.replace(/:00$/, '');
          return reserva;
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        this.errorMessage = this.translate.instant('gestor-reserves.loadError');
        this.loading = false;
      }
    );
  }

  deleteReserva(idReserva: number): void {

    const confirmDelete = confirm(this.translate.instant('gestor-reserves.confirmDelete'));
    if (!confirmDelete) {
      return;
    }

    this.reservas = this.reservas.filter((reserva) => reserva.idReserva !== idReserva);
    this.cdr.detectChanges();

    this.reservaStateService.deleteReserva(idReserva).subscribe(
      () => {
        alert(this.translate.instant('gestor-reserves.deleteSuccess'));
      },
      (error) => {
        alert(this.translate.instant('gestor-reserves.deleteError'));
      }
    );
  }

  editarReserva(reserva: any): void {

    if (!reserva.identificadorFiscalEmpresa) {
      return;
    }

    this.router.navigate(['/editar-reserva'], {
      queryParams: {
        idReserva: reserva.idReserva,
        identificadorFiscal: reserva.identificadorFiscalEmpresa,
        idServicio: reserva.idServicio,
      },
    });
  }

  trackByReserva(index: number, reserva: any): number {
    return reserva.idReserva || index;
  }
}