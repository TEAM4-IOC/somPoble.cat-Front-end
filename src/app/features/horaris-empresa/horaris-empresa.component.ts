import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Component({
  selector: 'app-horaris-empresa',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './horaris-empresa.component.html',
  styleUrls: ['./horaris-empresa.component.scss']
})
export class HorarisEmpresaComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  currentDay: number = new Date().getDate(); // Día actual del mes
  daysInMonth: { date: number; isCurrentMonth: boolean }[] = [];
  weekDays: number[] = [1, 2, 3, 4, 5, 6, 7];
  isMonthlyView: boolean = true;
  isTableView: boolean = false; // Nueva propiedad para la vista de tabla
  servicios: ServicioData[] = [];
  identificadorFiscal: string = '';
  reservas: any[] = [];
  private httpWithoutInterceptors: HttpClient; // Cliente HTTP sin interceptores

  constructor(
    private serviceState: ServiceStateService,
    private reservaStateService: ReservaStateService,
    private router: Router,
    private http: HttpClient,
    private httpBackend: HttpBackend // Inyectar HttpBackend
  ) {
    // Crear un cliente HTTP sin interceptores
    this.httpWithoutInterceptors = new HttpClient(this.httpBackend);
  }

  ngOnInit(): void {
    // Cargar el identificador fiscal desde la sesión
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const empresa = session.usuario?.empresas?.[0]; // Acceder a la primera empresa
      this.identificadorFiscal = empresa?.identificadorFiscal || ''; // Guardar el identificador fiscal
    }

    // Cargar los servicios de la empresa
    if (this.identificadorFiscal) {
      this.serviceState.loadServiciosByIdentificadorFiscal(this.identificadorFiscal);
      this.serviceState.service$.subscribe((servicios) => {
        this.servicios = servicios;
        this.generateCalendar(); // Generar el calendario con los servicios
      });

      // Llamada directa para obtener reservas sin pasar por el interceptor
      this.httpWithoutInterceptors
        .get<any[]>(`https://sompoblecatsb-production.up.railway.app/api/reservas/empresas/${this.identificadorFiscal}`)
        .subscribe(
          (reservas) => {
            this.reservas = reservas; // Guardar las reservas reales
            console.log('Reservas cargadas:', this.reservas);
          },
          (error) => {
            if (error.status === 404) {
              this.reservas = []; // Manejar el error 404 devolviendo un array vacío
              console.warn('No se encontraron reservas para la empresa.');
            } else {
              console.error('Error al cargar las reservas:', error);
            }
          }
        );
    } else {
      console.warn('No se encontró un identificador fiscal en la sesión.');
    }
  }

  // Mantener el resto del código original sin cambios
  get currentDayName(): string {
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay);
    return today.toLocaleString('default', { weekday: 'long' });
  }

  get currentMonthName(): string {
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ];
    return monthNames[this.currentMonth];
  }

  generateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay(); // Ajustar para que el lunes sea el primer día
    const lastDateOfMonth = lastDayOfMonth.getDate();

    this.daysInMonth = [];

    // Agregar días del mes anterior para completar la primera fila
    const daysFromPrevMonth = firstDayOfWeek - 1; // Días necesarios del mes anterior
    if (daysFromPrevMonth > 0) {
      const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
      const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
      const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

      for (let i = daysFromPrevMonth; i > 0; i--) {
        this.daysInMonth.push({ date: lastDayOfPrevMonth - i + 1, isCurrentMonth: false });
      }
    }

    // Agregar días del mes actual
    for (let i = 1; i <= lastDateOfMonth; i++) {
      this.daysInMonth.push({ date: i, isCurrentMonth: true });
    }

    // Agregar días del mes siguiente para completar la última fila
    const remainingCells = 7 - (this.daysInMonth.length % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        this.daysInMonth.push({ date: i, isCurrentMonth: false });
      }
    }
  }

  hasService(day: number): boolean {
    const today = new Date(this.currentYear, this.currentMonth, day).getDay();
    const adjustedDay = today === 0 ? 7 : today; // Ajustar el día de la semana (0 = Domingo -> 7)

    return this.servicios.some(servicio => {
      const diasLaborables = servicio.diasLaborables.split(',').map(Number); // Convertir "1,2,3" a [1, 2, 3]
      return diasLaborables.includes(adjustedDay);
    });
  }

  prevDay(): void {
    const currentDate = new Date(this.currentYear, this.currentMonth, this.currentDay - 1);
    this.currentYear = currentDate.getFullYear();
    this.currentMonth = currentDate.getMonth();
    this.currentDay = currentDate.getDate();
  }

  nextDay(): void {
    const currentDate = new Date(this.currentYear, this.currentMonth, this.currentDay + 1);
    this.currentYear = currentDate.getFullYear();
    this.currentMonth = currentDate.getMonth();
    this.currentDay = currentDate.getDate();
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  toggleView(): void {
    this.isMonthlyView = !this.isMonthlyView;
  }

  setView(view: 'monthly' | 'daily' | 'table'): void {
    this.isMonthlyView = view === 'monthly';
    this.isTableView = view === 'table';
  }

  getHours(): string[] {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) {
      const start = `${i.toString().padStart(2, '0')}:00`;
      const end = `${(i + 1).toString().padStart(2, '0')}:00`;
      hours.push(`${start} ${end}`);
    }
    return hours;
  }

  getServicesForDay(day: number): ServicioData[] {
    const dayData = this.daysInMonth.find(d => d.date === day && d.isCurrentMonth);
    if (!dayData || !dayData.isCurrentMonth) {
      return [];
    }
  
    const date = new Date(this.currentYear, this.currentMonth, day);
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
  
    return this.servicios.filter(servicio => {
      const diasLaborables = servicio.diasLaborables.split(',').map(Number);
      return diasLaborables.includes(dayOfWeek);
    });
  }
  
  isServiceAvailable(servicio: ServicioData, hour: string): boolean {
    const [hourStart] = servicio.horarioInicio.split(':').map(Number);
    const [hourEnd] = servicio.horarioFin.split(':').map(Number);
    const currentHour = parseInt(hour.split(':')[0], 10);
  
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay).getDay();
    return (
      servicio.diasLaborables.split(',').map(Number).includes(today) &&
      currentHour >= hourStart &&
      currentHour < hourEnd
    );
  } 

  getServiceColor(servicio: ServicioData): string {
    const hue = (servicio.idServicio * 137) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  goToDailyView(day: { date: number; isCurrentMonth: boolean }): void {
    if (!day.isCurrentMonth) {
      return;
    }
  
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
      calendarContainer.classList.add('hidden');
      setTimeout(() => {
        this.currentDay = day.date;
        this.isMonthlyView = false;
        calendarContainer.classList.remove('hidden');
      }, 300);
    }
  }

  getReservasForServiceAndHour(idServicio: number, hour: string): { id: number; estado: string; dniCliente: string }[] {
    const [hourStart] = hour.split(' ');
    const currentDate = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${this.currentDay.toString().padStart(2, '0')}`;
  
    return this.reservas
      .filter((reserva) => {
        const reservaHora = reserva.hora.slice(0, 5);
        return (
          reserva.idServicio === idServicio &&
          reservaHora === hourStart &&
          reserva.fechaReserva === currentDate
        );
      })
      .map((reserva) => ({
        id: reserva.idReserva,
        estado: reserva.estado,
        dniCliente: reserva.dniCliente,
      }));
  }

  isPastDay(date: number, isCurrentMonth: boolean): boolean {
    if (!isCurrentMonth) return false;
    const today = new Date();
    const currentDate = new Date(this.currentYear, this.currentMonth, date);
  
    return currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  getReservasAgrupadasPorServicio(): { servicio: ServicioData; reservas: any[] }[] {
    return this.servicios.map((servicio) => {
      const reservasDelServicio = this.reservas.filter(
        (reserva) => reserva.idServicio === servicio.idServicio
      );
      return {
        servicio,
        reservas: reservasDelServicio,
      };
    });
  }

  onEditServiceClick(servicio: ServicioData): void {
    const serviceId = servicio.idServicio; // Obtenim l'ID del servei
    this.router.navigate([`services-form/${serviceId}`]); // Redirigim a la URL
  }

  onDeleteReserva(idReserva: number): void {
    if (confirm('Estàs segur que vols eliminar aquesta reserva?')) {
      this.reservaStateService.deleteReserva(idReserva).subscribe({
        next: () => {
          alert('Reserva eliminada correctament.');
          // Actualitzar la llista de reserves localment
          this.reservas = this.reservas.filter((reserva) => reserva.idReserva !== idReserva);
        },
        error: (err) => {
          console.error('Error eliminant la reserva:', err);
          alert('No s\'ha pogut eliminar la reserva.');
        },
      });
    }
  }

  formatDateToDDMMYYYY(dateString: string): string {
    const [year, month, day] = dateString.split('-'); // Divideix la cadena en any, mes i dia
    return `${day}-${month}-${year}`; // Reorganitza en format DD-MM-YYYY
  }

  get currentDayOfWeek(): number {
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay);
    const dayOfWeek = today.getDay(); // 0 = Diumenge, 1 = Dilluns, ..., 6 = Dissabte
    return dayOfWeek === 0 ? 7 : dayOfWeek; // Ajustar perquè 7 sigui Diumenge
  }
}