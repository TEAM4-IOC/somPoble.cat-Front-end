import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  servicios = [
    {
      nombre: 'Servicio A',
      horarioInicio: '09:00',
      horarioFin: '11:00',
      diasLaborables: [1, 2, 3, 4, 5], // Lunes a Viernes
      color: '#FF5733' // Color único
    },
    {
      nombre: 'Servicio B',
      horarioInicio: '10:00',
      horarioFin: '12:00',
      diasLaborables: [1, 2, 3, 4, 5], // Lunes a Viernes
      color: '#33FF57' // Color único
    },
    {
      nombre: 'Servicio C',
      horarioInicio: '09:30',
      horarioFin: '10:30',
      diasLaborables: [1, 3, 5], // Lunes, Miércoles y Viernes
      color: '#3357FF' // Color único
    }
  ];
  ngOnInit(): void {
    this.generateCalendar();
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

  hasService(day: number): boolean {
    const today = new Date(this.currentYear, this.currentMonth, day).getDay();
    return this.servicios.some(servicio =>
      servicio.diasLaborables.includes(today)
    );
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

  isServiceAvailable(servicio: any, hour: string): boolean {
    const [hourStart] = servicio.horarioInicio.split(':').map(Number);
    const [hourEnd] = servicio.horarioFin.split(':').map(Number);
    const currentHour = parseInt(hour.split(':')[0], 10);
  
    // Verificar si el servicio está disponible en el día actual y la hora actual
    const today = new Date(this.currentYear, this.currentMonth, this.currentDay).getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    return (
      servicio.diasLaborables.includes(today) &&
      currentHour >= hourStart &&
      currentHour < hourEnd
    );
  }
}