import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ReservaStateService } from '../../core/services/reserva-state.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-editar-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './editar-reserva.component.html',
  styleUrls: ['./editar-reserva.component.scss']
})
export class EditarReservaComponent implements OnInit {
  serviceData: any = null;
  reservaForm: FormGroup;
  availableHours: string[] = [];
  minDate: string = '';
  maxDate: string = '';
  isHourSelectionEnabled: boolean = false;

  idReserva: number | null = null;
  isEditMode: boolean = true;
  isLaborableDay: boolean = true;
  diasLaborables: number[] = [];
  dniCliente: string | null = null;

  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  daysInMonth: { date: Date | null; isAvailable: boolean; isPast?: boolean }[] = [];
  selectedDate: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private serviceStateService: ServiceStateService,
    private reservaStateService: ReservaStateService,
    private translate: TranslateService
  ) {
    this.reservaForm = this.fb.group({
      fechaReserva: ['', Validators.required],
      hora: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.idReserva = params['idReserva'] ? +params['idReserva'] : null;
      const identificadorFiscal = params['identificadorFiscal'];
      const idServicio = +params['idServicio'];

      if (!this.idReserva || !identificadorFiscal || !idServicio) {
        this.router.navigate(['/gestor-reserves-cli']);
        return;
      }

      this.carregarReserva(this.idReserva);
      this.carregarDadesDelServei(identificadorFiscal, idServicio);
    });
  }

  carregarReserva(idReserva: number): void {
    this.reservaStateService.getReservaById(idReserva).subscribe(
      (reserva) => {
        this.reservaForm.patchValue({
          fechaReserva: reserva.fechaReserva,
          hora: reserva.hora
        });
        this.dniCliente = reserva.dniCliente;
        this.onDateChange(reserva.fechaReserva);
      },
      () => {
        this.router.navigate(['/gestor-reserves-cli']);
      }
    );
  }

  carregarDadesDelServei(identificadorFiscal: string, idServicio: number): void {
    this.serviceStateService.getServicioHorarioById(identificadorFiscal, idServicio).subscribe(
      data => {
        this.serviceData = data;
        if (this.serviceData.diasLaborables) {
          this.diasLaborables = this.serviceData.diasLaborables
            .split(',')
            .map((dia: string) => parseInt(dia.trim(), 10));
        } else {
          this.diasLaborables = [];
        }
        this.setupAvailableDatesAndHours();
        this.generateCalendar();
      },
      () => {
        console.error('Error al carregar les dades del servei. Si us plau, torna-ho a intentar.');
      }
    );
  }

  setupAvailableDatesAndHours(): void {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30);
    this.maxDate = maxDate.toISOString().split('T')[0];

    const startHour = parseInt(this.serviceData.horarioInicio.split(':')[0], 10);
    const endHour = parseInt(this.serviceData.horarioFin.split(':')[0], 10);

    this.availableHours = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      this.availableHours.push(formattedHour);
    }

    if (this.availableHours.length > 0) {
      this.reservaForm.patchValue({ hora: this.availableHours[0] });
    }
  }

  generateCalendar(): void {
    if (!this.serviceData || !this.serviceData.diasLaborables) {
      return;
    }

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
      this.daysInMonth.push({ date: null, isAvailable: false });
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
    if (!this.serviceData) {
      return;
    }

    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (!this.serviceData) {
      return;
    }

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
    this.reservaForm.patchValue({ fechaReserva: this.selectedDate });
    this.onDateChange(this.selectedDate);
  }

  onDateChange(selectedDate: string): void {
    if (!selectedDate) {
      alert(this.translate.instant('gestor-reserves.invalidDate'));
      return;
    }

    if (!this.serviceData || !this.serviceData.identificadorFiscal) {
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
          alert(this.translate.instant('gestor-reserves.noAvailableHours'));
        }
      },
      () => {
        this.reservaForm.get('hora')?.disable();
        alert(this.translate.instant('gestor-reserves.loadError'));
      }
    );
  }

  onSubmit(): void {
    if (this.reservaForm.invalid) {
      alert(this.translate.instant('gestor-reserves.formIncomplete'));
      return;
    }
  
    if (!this.dniCliente) {
      return;
    }
  
    let horaSeleccionada = this.reservaForm.value.hora ?? '';
  
    const payload = {
      fechaReserva: this.reservaForm.value.fechaReserva,
      hora: horaSeleccionada,
      cliente: {
        dni: this.dniCliente
      },
      empresa: {
        identificadorFiscal: this.route.snapshot.queryParams['identificadorFiscal']
      },
      servicio: {
        idServicio: +this.route.snapshot.queryParams['idServicio']
      }
    };
  
    this.reservaStateService.updateReserva(this.idReserva!, payload).subscribe(
      () => {
        alert(this.translate.instant('gestor-reserves.reservationUpdated'));
        this.router.navigate(['/gestor-reserves-cli']);
      },
      () => {
        alert(this.translate.instant('gestor-reserves.reservationUpdateError'));
      }
    );
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

  onHourChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedHour = target?.value;
  
    if (!selectedHour) {
      console.error('Error: Hora seleccionada és null o buida.');
      return;
    }
    this.reservaForm.patchValue({ hora: selectedHour });
  }
}