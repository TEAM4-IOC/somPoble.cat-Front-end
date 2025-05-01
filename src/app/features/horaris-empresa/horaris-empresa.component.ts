import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  currentDay: number = new Date().getDate();
  daysInMonth: { date: number; isCurrentMonth: boolean }[] = [];
  weekDays: number[] = [1, 2, 3, 4, 5, 6, 7];
  isMonthlyView: boolean = true;
  isTableView: boolean = false;
  isCardsView = false;
  isDailyView: boolean = false;

  servicios: ServicioData[] = [];
  identificadorFiscal: string = '';
  reservas: any[] = [];



  constructor(
    private serviceState: ServiceStateService,
    private reservaStateService: ReservaStateService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe((params) => {
      console.log('Parámetros de consulta:', params);
      const view = params['view'];
      if (view === 'table') {
        this.setView('table');
      } else if (view === 'cards') {
        this.setView('cards');
      } else if (view === 'daily') {
        this.setView('daily');
      } else {
        this.setView('monthly');
      }
    });

    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const empresa = session.usuario?.empresas?.[0];
      this.identificadorFiscal = empresa?.identificadorFiscal || '';
    }


    if (this.identificadorFiscal) {
      this.serviceState.saveAndEmit([]);
      this.serviceState.loadServiciosByIdentificadorFiscal(this.identificadorFiscal);
      this.serviceState.service$.subscribe((servicios) => {
        this.servicios = servicios;
        this.generateCalendar();
      });

      this.reservaStateService.loadReservasByEmpresa(this.identificadorFiscal);
    this.reservaStateService.reservas$.subscribe((reservas) => {
      console.log('[DEBUG] Reservas cargadas desde reservas$:', reservas);
      this.reservas = reservas;
    });

    } else {
      console.warn('No se encontró un identificador fiscal en la sesión.');
    }
  }


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
    const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
    const lastDateOfMonth = lastDayOfMonth.getDate();

    this.daysInMonth = [];


    const daysFromPrevMonth = firstDayOfWeek - 1;
    if (daysFromPrevMonth > 0) {
      const prevMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1;
      const prevYear = this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear;
      const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

      for (let i = daysFromPrevMonth; i > 0; i--) {
        this.daysInMonth.push({ date: lastDayOfPrevMonth - i + 1, isCurrentMonth: false });
      }
    }


    for (let i = 1; i <= lastDateOfMonth; i++) {
      this.daysInMonth.push({ date: i, isCurrentMonth: true });
    }


    const remainingCells = 7 - (this.daysInMonth.length % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        this.daysInMonth.push({ date: i, isCurrentMonth: false });
      }
    }
  }

  hasService(day: number): boolean {
    const today = new Date(this.currentYear, this.currentMonth, day).getDay();
    const adjustedDay = today === 0 ? 7 : today;

    return this.servicios.some(servicio => {
      const diasLaborables = servicio.diasLaborables.split(',').map(Number);
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



  setView(view: 'monthly' | 'daily' | 'table' | 'cards'): void {
    this.isMonthlyView = view === 'monthly';
    this.isDailyView = view === 'daily';
    this.isTableView = view === 'table';
    this.isCardsView = view === 'cards';
    console.log('Vista actual:', { isMonthlyView: this.isMonthlyView, isDailyView: this.isDailyView, isTableView: this.isTableView, isCardsView: this.isCardsView });
  }

  cards(): {
    label: string;
    descripcion: string;
    duracion: number;
    precio: number;
    availability: string;
    schedule: string;
    route: string;
    queryParams?: any;
  }[] {
    return this.servicios.map(servicio => ({
      label: servicio.nombre,
      descripcion: servicio.descripcion,
      duracion: servicio.duracion,
      precio: servicio.precio,
      availability: this.formatDays(servicio.diasLaborables),
      schedule: this.formatHours(servicio.horarioInicio, servicio.horarioFin),
      route: `services-form/${servicio.idServicio}`
    }));
  }

  goTo(route: string): void {
    this.router.navigateByUrl(route);
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

    this.currentDay = day.date;
    this.isMonthlyView = false;
    this.isDailyView = true;

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

  hasReservas(): boolean {
    return this.reservas && this.reservas.length > 0;
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
    const serviceId = servicio.idServicio;
    this.router.navigate([`services-form/${serviceId}`]);
  }

  onDeleteReserva(idReserva: number): void {
    if (confirm('Estàs segur que vols eliminar aquesta reserva?')) {
      this.reservaStateService.deleteReserva(idReserva).subscribe({
        next: () => {
          alert('Reserva eliminada correctament.');

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
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  }

  get currentDayOfWeek(): number {
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay);
    const dayOfWeek = today.getDay();
    return dayOfWeek === 0 ? 7 : dayOfWeek;
  }

  trackByCard(index: number, card: { label: string; route: string; queryParams?: any }): string {
    return card.route;
  }

  formatDays(diasLaborables: string): string {
    const dayOrder = ['1', '2', '3', '4', '5', '6', '7'];
    const diasOrdenados = diasLaborables
      .split(',')
      .sort((a, b) => dayOrder.indexOf(a.trim()) - dayOrder.indexOf(b.trim()));

    return diasOrdenados
      .map(dia => this.translate.instant(`serviceDetail.days.${dia.trim()}`))
      .join(', ');
  }

  formatHours(horarioInicio: string, horarioFin: string): string {
    const start = horarioInicio.replace(':00', '');
    const end = horarioFin.replace(':00', '');
    return `${start} a ${end}`;
  }

  goToEspaiClient(): void {
    this.router.navigate(['/espai-empresa']);
  }

  public deleteServicio(idServicio: number): void {
    if (!this.identificadorFiscal) {
      return;
    }

    this.serviceState.deleteServicio(idServicio, this.identificadorFiscal).subscribe(
      () => {
        alert(this.translate.instant('add-services-form.deleteOK'));
        this.servicios = this.servicios.filter(servicio => servicio.idServicio !== idServicio);
        this.router.navigate(['/espai-empresa']);
      },
      (error) => {
        alert(this.translate.instant('add-services-form.deleteKO'));
      }
    );
  }
}