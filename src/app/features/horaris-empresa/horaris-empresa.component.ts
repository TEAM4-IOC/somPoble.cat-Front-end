import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { ReservaStateService } from '../../core/services/reserva-state.service';

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
  reservas: any[] = [];

  constructor(private serviceState: ServiceStateService, private reservaState: ReservaStateService) {}

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
  
      // Cargar las reservas reales
      this.reservaState.getReservasByEmpresa(this.identificadorFiscal).subscribe(
        (reservas) => {
          this.reservas = reservas; // Guardar las reservas reales
          console.log('Reservas cargadas:', this.reservas);
        },
        (error) => {
          console.error('Error al cargar las reservas:', error);
        }
      );
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
    // Verificar si el día pertenece al mes actual
    const dayData = this.daysInMonth.find(d => d.date === day && d.isCurrentMonth);
    if (!dayData || !dayData.isCurrentMonth) {
      return []; // No devolver servicios si el día no pertenece al mes actual
    }
  
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
    const hue = (servicio.idServicio * 137) % 360; // Generar un tono único basado en el ID
    return `hsl(${hue}, 70%, 50%)`; // Usar HSL para generar colores
  }

  goToDailyView(day: { date: number; isCurrentMonth: boolean }): void {
    if (!day.isCurrentMonth) {
      return; // No hacer nada si el día no pertenece al mes actual
    }
  
    const calendarContainer = document.querySelector('.calendar-container');
    if (calendarContainer) {
      calendarContainer.classList.add('hidden'); // Añadir la clase para la animación
      setTimeout(() => {
        this.currentDay = day.date; // Actualizar el día seleccionado
        this.isMonthlyView = false; // Cambiar a la vista diaria
        calendarContainer.classList.remove('hidden'); // Quitar la clase después de cambiar la vista
      }, 300); // Esperar a que termine la animación
    }
  }

  // Método para obtener las reservas de un servicio en una hora específica
  getReservasForServiceAndHour(idServicio: number, hour: string): { id: number; estado: string; dniCliente: string }[] {
    const [hourStart] = hour.split(' '); // Obtener solo la hora inicial (ejemplo: "10:00")
    const currentDate = `${this.currentYear}-${(this.currentMonth + 1).toString().padStart(2, '0')}-${this.currentDay.toString().padStart(2, '0')}`;
  
    return this.reservas
      .filter((reserva) => {
        const reservaHora = reserva.hora.slice(0, 5); // Extraer solo "HH:mm" de "HH:mm:ss"
        return (
          reserva.idServicio === idServicio &&
          reservaHora === hourStart && // Comparar solo "HH:mm"
          reserva.fechaReserva === currentDate // Comparar la fecha exacta
        );
      })
      .map((reserva) => ({
        id: reserva.idReserva,
        estado: reserva.estado,
        dniCliente: reserva.dniCliente, // Añadir el DNI del cliente
      }));
  }

  isPastDay(date: number, isCurrentMonth: boolean): boolean {
    if (!isCurrentMonth) return false; // Només aplicar als dies del mes actual
    const today = new Date();
    const currentDate = new Date(this.currentYear, this.currentMonth, date);
  
    // Comprovar si el dia és anterior a avui (excloent el dia actual)
    return currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

}