import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-gestor-reserves-cli',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './gestor-reserves-cli.component.html',
  styleUrls: ['./gestor-reserves-cli.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestorReservesCliComponent implements OnInit {
  reservas: any[] = []; // Llista de reserves
  dniCliente: string = ''; // DNI del client obtingut de la sessió
  errorMessage: string = '';
  loading: boolean = true; // Estat de càrrega

  constructor(
    private reservaStateService: ReservaStateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDniFromSession();
    this.loadReservas(); // Carreguem les reserves directament des de l'API
  }

  // Recuperar el DNI del client de la sessió
  loadDniFromSession(): void {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        const cliente = session.usuario;
        this.dniCliente = cliente?.dni || '';
        console.log('DNI del client recuperat de la sessió:', this.dniCliente);
      } catch (error) {
        console.error('Error al parsejar la sessió:', error);
        this.errorMessage = 'Error al recuperar la sessió.';
      }
    } else {
      console.warn('No s\'ha trobat cap sessió al localStorage.');
      this.errorMessage = 'No s\'ha trobat cap sessió activa.';
    }
  }

  // Carregar les reserves del client des de l'API
  loadReservas(): void {
    this.reservaStateService.getReservasByCliente(this.dniCliente).subscribe(
      (reservas) => {
        console.log('Reserves carregades:', reservas); // Log de les reserves carregades
        this.reservas = reservas.map((reserva) => {
          reserva.hora = reserva.hora.replace(/:00$/, ''); // Formatem l'hora si cal
          return reserva;
        });
        this.loading = false;
        this.cdr.detectChanges(); // Força la detecció de canvis
      },
      (error) => {
        console.error('Error al carregar les reserves:', error);
        this.errorMessage = 'No s\'han pogut carregar les reserves.';
        this.loading = false;
      }
    );
  }

  deleteReserva(idReserva: number): void {
    if (confirm('Estàs segur que vols eliminar aquesta reserva?')) {
      // Actualitzem l'estat local immediatament
      this.reservas = this.reservas.filter((reserva) => reserva.idReserva !== idReserva);
      this.cdr.detectChanges(); // Forcem l'actualització de la vista

      this.reservaStateService.deleteReserva(idReserva).subscribe(
        () => {
          console.log(`Reserva amb ID ${idReserva} eliminada correctament.`);
          alert('Reserva eliminada correctament.');
        },
        (error) => {
          console.error(`Error al eliminar la reserva amb ID ${idReserva}:`, error);
          alert('Hi ha hagut un problema al eliminar la reserva.');
        }
      );
    }
  }

  editarReserva(reserva: any): void {
    console.log('Reserva seleccionada per editar:', reserva); // Log per depurar l'objecte complet

    // Verificar si identificadorFiscalEmpresa existeix
    if (!reserva.identificadorFiscalEmpresa) {
      console.error('Error: identificadorFiscalEmpresa no està definit a l\'objecte reserva.');
      return;
    }

    console.log('Identificador Fiscal enviat:', reserva.identificadorFiscalEmpresa); // Log per verificar el valor

    this.router.navigate(['/editar-reserva'], {
      queryParams: {
        idReserva: reserva.idReserva, // ID de la reserva
        identificadorFiscal: reserva.identificadorFiscalEmpresa, // Identificador fiscal de l'empresa
        idServicio: reserva.idServicio, // ID del servei
      },
    });
  }
}