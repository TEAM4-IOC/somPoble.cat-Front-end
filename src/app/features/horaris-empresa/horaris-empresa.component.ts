import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';

@Component({
  selector: 'app-horaris-empresa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horaris-empresa.component.html',
  styleUrls: ['./horaris-empresa.component.scss']
})
export class HorarisEmpresaComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  currentDay: number = new Date().getDate(); // Día actual del mes
  daysInMonth: { date: number; isCurrentMonth: boolean }[] = [];
  weekDays: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  isMonthlyView: boolean = true;
  servicios: ServicioData[] = [];
  identificadorFiscal: string = '';

  constructor(private serviceState: ServiceStateService) {}

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
    } else {
      console.warn('No se encontró un identificador fiscal en la sesión.');
    }
  }

  get currentDayName(): string {
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay);
    return today.toLocaleString('default', { weekday: 'long' });
  }

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  generateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
    const lastDateOfMonth = lastDayOfMonth.getDate();

    this.daysInMonth = [];

    // Agregar días del mes anterior
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, -i + 1);
      this.daysInMonth.push({ date: date.getDate(), isCurrentMonth: false });
    }

    // Agregar días del mes actual
    for (let i = 1; i <= lastDateOfMonth; i++) {
      this.daysInMonth.push({ date: i, isCurrentMonth: true });
    }

    // Agregar días del mes siguiente
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

  getHours(): string[] {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0') + ':00');
    }
    return hours;
  }

  getServicesForDay(day: number): ServicioData[] {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Ajustar el día de la semana
  
    // Filtrar los servicios que están disponibles en este día
    return this.servicios.filter(servicio => {
      const diasLaborables = servicio.diasLaborables.split(',').map(Number);
      return diasLaborables.includes(dayOfWeek);
    });
  }
  
  isServiceAvailable(servicio: ServicioData, hour: string): boolean {
    const [hourStart] = servicio.horarioInicio.split(':').map(Number);
    const [hourEnd] = servicio.horarioFin.split(':').map(Number);
    const currentHour = parseInt(hour.split(':')[0], 10);
  
    // Verificar si el servicio está disponible en el día actual y la hora actual
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay).getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    return (
      servicio.diasLaborables.split(',').map(Number).includes(today) &&
      currentHour >= hourStart &&
      currentHour < hourEnd
    );
  }  
  getServiceColor(servicio: ServicioData): string {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFC300', '#DAF7A6'];
    const index = servicio.idServicio % colors.length; // Asignar un color basado en el ID del servicio
    return colors[index];
  }

}