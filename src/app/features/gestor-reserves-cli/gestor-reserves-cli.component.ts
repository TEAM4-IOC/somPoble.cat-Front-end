import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestor-reserves-cli',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestor-reserves-cli.component.html',
  styleUrls: ['./gestor-reserves-cli.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestorReservesCliComponent implements OnInit {
  reservas: any[] = []; // Llista de reserves
  servicios: any[] = []; // Llista de serveis
  dniCliente: string = ''; // DNI del client obtingut de la sessió
  errorMessage: string = '';
  loading: boolean = true; // Estat de càrrega

  constructor(
    private reservaStateService: ReservaStateService,
    private serviceStateService: ServiceStateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDniFromSession();
    this.loadServicios().then(() => {
      this.loadReservas(); // Carreguem les reserves només després de carregar els serveis
    });
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

  // Carregar les reserves del client
  loadReservas(): void {
    this.reservaStateService.getReservasByCliente(this.dniCliente).subscribe(
      (reservas) => {
        console.log('Reserves carregades:', reservas); // Log de les reserves carregades
        console.log('Serveis disponibles:', this.servicios); // Log dels serveis carregats
  
        this.reservas = reservas.map((reserva) => {
          // Busquem el servei corresponent a la reserva localment
          let servicio = this.servicios.find((s) => {
            console.log(`Comparant reserva.idServicio (${reserva.idServicio}) amb servei.idServicio (${s.idServicio})`);
            return String(s.idServicio) === String(reserva.idServicio); // Convertim a cadena per evitar problemes de tipus
          });
  
          // Si no trobem el servei localment, el carreguem des de l'API
          if (!servicio) {
            console.warn(`Servei no trobat localment per reserva.idServicio: ${reserva.idServicio}`);
            this.serviceStateService
              .getServicioHorarioById(reserva.identificadorFiscalEmpresa, reserva.idServicio)
              .subscribe(
                (servicioApi) => {
                  console.log(`Servei carregat des de l'API per reserva.idServicio: ${reserva.idServicio}`, servicioApi);
                  reserva.nombreServicio = servicioApi.nombre; // Assignem el nom del servei
                  this.cdr.detectChanges(); // Actualitzem la vista
                },
                (error) => {
                  console.error(`Error al carregar el servei des de l'API per reserva.idServicio: ${reserva.idServicio}`, error);
                  reserva.nombreServicio = 'Desconegut'; // Assignem "Desconegut" si hi ha un error
                }
              );
          } else {
            console.log('Servei trobat localment:', servicio);
            reserva.nombreServicio = servicio.nombre; // Assignem el nom del servei trobat localment
          }
  
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

  // Carregar tots els serveis
  loadServicios(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serviceStateService.service$.subscribe(
        (servicios) => {
          this.servicios = servicios; // Guardem els serveis carregats
          console.log('Serveis carregats:', this.servicios); // Log per verificar els serveis
          resolve(); // Resol el Promise quan els serveis estan carregats
        },
        (error) => {
          console.error('Error al carregar els serveis:', error);
          reject(error); // Rebutja el Promise si hi ha un error
        }
      );
  
      // Carreguem els serveis des de l'API
      this.serviceStateService.loadServicios();
    });
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
          alert('Hi ha hagut un problema al eliminar la reserva. Tot i això, pot ser que ja s\'hagi eliminat.');
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
        idServicio: reserva.idServicio // ID del servei
      },
    });
  }
}