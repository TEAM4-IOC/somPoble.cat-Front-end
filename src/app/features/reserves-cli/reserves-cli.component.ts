import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reserves-cli',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './reserves-cli.component.html',
  styleUrls: ['./reserves-cli.component.scss']
})
export class ReservesCliComponent implements OnInit {
  serviceData: any = null;
  reservaForm: FormGroup;
  availableHours: string[] = [];
  minDate: string = '';
  maxDate: string = '';
  isHourSelectionEnabled: boolean = false;

  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  daysInMonth: { date: Date | null; isAvailable: boolean; isPast?: boolean }[] = [];
  selectedDate: string | null = null;

  isLaborableDay: boolean = true;
  dniCliente: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private serviceStateService: ServiceStateService,
    private reservaStateService: ReservaStateService,
    private translateService: TranslateService

  ) {
    this.reservaForm = this.fb.group({
      fechaReserva: ['', Validators.required],
      hora: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const cliente = session.usuario;
      this.dniCliente = cliente?.dni || '';
    }

    this.route.queryParams.subscribe(params => {
      const identificadorFiscal = params['identificadorFiscal'];
      const idServicio = +params['id'];

      if (!identificadorFiscal || !idServicio) {
        return;
      }

      this.serviceStateService.getServicioHorarioById(identificadorFiscal, idServicio).subscribe(
        data => {
          this.serviceData = data;

          this.setupAvailableDatesAndHours();
          this.generateCalendar();
        },
        error => { }
      );
    });
  }

  setupAvailableDatesAndHours(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    this.maxDate = maxDate.toISOString().split('T')[0];

    const startHour = parseInt(this.serviceData.horarioInicio.split(':')[0], 10);
    const endHour = parseInt(this.serviceData.horarioFin.split(':')[0], 10);
    this.availableHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => `${startHour + i}:00`);
  }

  generateCalendar(): void {
    const year = this.currentYear;
    const month = this.currentMonth;
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const laborableDays = this.serviceData.diasLaborables.split(',').map((dia: string) => parseInt(dia.trim(), 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.daysInMonth = [];

    for (let i = 0; i < adjustedFirstDay; i++) {
      this.daysInMonth.push({ date: null, isAvailable: false, isPast: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();

      const isLaborable = laborableDays.includes(dayOfWeek);
      const isPast = date < today;

      this.daysInMonth.push({
        date,
        isAvailable: isLaborable && !isPast,
        isPast
      });
    }
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

  selectDate(day: any): void {
    if (!day.date || !day.isAvailable) {
      return;
    }

    const year = day.date.getFullYear();
    const month = (day.date.getMonth() + 1).toString().padStart(2, '0');
    const dayOfMonth = day.date.getDate().toString().padStart(2, '0');
    this.selectedDate = `${year}-${month}-${dayOfMonth}`;

    if (this.selectedDate) {
      this.onDateChange(this.selectedDate);
    } else {
      console.error('Error: selectedDate és null.');
    }
  }

  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) {
      return false;
    }

    const selected = new Date(this.selectedDate);

    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
  }

  onDateChange(selectedDate: string): void {

    try {
      if (!selectedDate) {
        alert(this.translateService.instant('reservesCli.invalidDate')); // Usar la clave de traducción
        return;
      }

      if (!this.serviceData || !this.serviceData.identificadorFiscal) {
        console.error('Error: Les dades del servei no estan disponibles.');
        return;
      }

      this.reservaStateService.getReservasByEmpresa(this.serviceData.identificadorFiscal).subscribe(
        (reservas) => {

          const reservedHours = reservas
            .filter((reserva: any) => reserva.fechaReserva === selectedDate)
            .map((reserva: any) => reserva.hora.slice(0, 5));

          const startHour = parseInt(this.serviceData.horarioInicio.split(':')[0], 10);
          const endHour = parseInt(this.serviceData.horarioFin.split(':')[0], 10) - 1;

          const allHours = [];
          for (let hour = startHour; hour <= endHour; hour++) {
            const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
            allHours.push(formattedHour);
          }

          this.availableHours = allHours.filter((hour) => !reservedHours.includes(hour));

          if (this.availableHours.length > 0) {
            this.reservaForm.get('hora')?.enable();
          } else {
            this.reservaForm.get('hora')?.disable();
            alert(this.translateService.instant('reservesCli.noAvailableHours'));
          }
        },
        (error) => {
          this.reservaForm.get('hora')?.disable();
        }
      );
    } catch (error) { }
  }

  createReserva(): void {

    if (!this.reservaForm.get('fechaReserva')?.value && this.selectedDate) {
      this.reservaForm.get('fechaReserva')?.setValue(this.selectedDate);
    }

    if (!this.reservaForm.get('hora')?.value && this.availableHours.length > 0) {
      this.reservaForm.get('hora')?.setValue(this.availableHours[0]);
    }

    this.reservaForm.updateValueAndValidity();

    if (this.reservaForm.invalid) {
      alert(this.translateService.instant('reservesCli.formIncomplete'));
      return;
    }

    if (!this.serviceData || !this.serviceData.identificadorFiscal) {
      console.error('Les dades del servei no estan disponibles o són incompletes:', this.serviceData);
      return;
    }

    const payload = {
      reserva: {
        cliente: {
          dni: this.dniCliente
        },
        empresa: {
          identificadorFiscal: this.serviceData.identificadorFiscal
        },
        servicio: {
          idServicio: this.serviceData.idServicio
        },
        fechaReserva: this.reservaForm.value.fechaReserva,
        hora: this.reservaForm.value.hora,
        estado: 'pendiente'
      }
    };

    this.reservaStateService.createReserva(payload).subscribe(
      response => {
        alert(this.translateService.instant('reservesCli.reservationCreated'));
        this.router.navigate(['/gestor-reserves-cli'],);
      },
      error => {
        alert(this.translateService.instant('reservesCli.reservationError'));
      }
    );
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
    return `reservesCli.months.${monthNames[this.currentMonth]}`;
  }
}