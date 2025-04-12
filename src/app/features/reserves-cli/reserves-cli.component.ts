import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ReservaStateService } from '../../core/services/reserva-state.service';

@Component({
  selector: 'app-reserves-cli',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  // Variables per al calendari
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  daysInMonth: { date: Date | null; isAvailable: boolean; isPast?: boolean }[] = [];
  selectedDate: string | null = null;

  isLaborableDay: boolean = true;
  dniCliente: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private serviceStateService: ServiceStateService,
    private reservaStateService: ReservaStateService
  ) {
    this.reservaForm = this.fb.group({
      fechaReserva: ['', Validators.required],
      hora: [{ value: '', disabled: true }, Validators.required] // Inicialment deshabilitat
    });
  }

  ngOnInit(): void {
    const sessionStr = localStorage.getItem('session');
    console.log('GUARDADO SESION:', sessionStr);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      const cliente = session.usuario;
      this.dniCliente = cliente?.dni || '';
      console.log('DNI del client recuperat de la sessió:', this.dniCliente);
    }

    this.route.queryParams.subscribe(params => {
      const identificadorFiscal = params['identificadorFiscal'];
      const idServicio = +params['id'];

      if (!identificadorFiscal || !idServicio) {
        console.error('Falten paràmetres a la URL: identificadorFiscal o idServicio');
        alert('Falten paràmetres necessaris per carregar el servei.');
        return;
      }

      this.serviceStateService.getServicioHorarioById(identificadorFiscal, idServicio).subscribe(
        data => {
          this.serviceData = data;
          console.log('Dades del servei:', this.serviceData);

          this.setupAvailableDatesAndHours();
          this.generateCalendar();
        },
        error => {
          console.error('Error al carregar les dades del servei:', error);
          alert('Error al carregar les dades del servei. Si us plau, torna-ho a intentar.');
        }
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
    const adjustedFirstDay = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); // Ajustar perquè dilluns sigui el primer dia
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const laborableDays = this.serviceData.diasLaborables.split(',').map((dia: string) => parseInt(dia.trim(), 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Eliminar hores per comparar només dates

    this.daysInMonth = [];

    // Afegir dies buits per ajustar el primer dia del mes
    for (let i = 0; i < adjustedFirstDay; i++) {
      this.daysInMonth.push({ date: null, isAvailable: false, isPast: false });
    }

    // Afegir els dies del mes
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
      console.log('Dia no seleccionable:', day);
      return;
    }

    console.log('Dia seleccionat:', day.date);
    this.selectedDate = day.date.toISOString().split('T')[0]; // Guardar la data seleccionada

    if (this.selectedDate) {
      this.onDateChange(this.selectedDate); // Passar la data seleccionada
    } else {
      console.error('Error: selectedDate és null.');
    }
  }

  isSelected(date: Date | null): boolean {
    if (!date || !this.selectedDate) {
      return false;
    }

    // Convertir les dates a format "YYYY-MM-DD" per comparar només la part de la data
    const selectedDateStr = new Date(this.selectedDate).toISOString().split('T')[0];
    const dateStr = date.toISOString().split('T')[0];

    return selectedDateStr === dateStr;
  }

  onDateChange(selectedDate: string): void {
    console.log('onDateChange s\'ha cridat.');
    console.log('Dia seleccionat (ajustat):', selectedDate);

    try {
      if (!selectedDate) {
        console.error('Error: selectedDate és buit o no vàlid:', selectedDate);
        alert('Error: Selecciona una data vàlida.');
        return;
      }

      if (!this.serviceData || !this.serviceData.identificadorFiscal) {
        console.error('Error: Les dades del servei no estan disponibles.');
        alert('Error: No es poden obtenir les hores disponibles perquè falten dades del servei.');
        return;
      }

      console.log('Cridant l\'API per obtenir reserves amb identificadorFiscal:', this.serviceData.identificadorFiscal);

      this.reservaStateService.getReservasByEmpresa(this.serviceData.identificadorFiscal).subscribe(
        (reservas) => {
          console.log('Reserves retornades per l\'API:', reservas);

          const reservedHours = reservas
            .filter((reserva: any) => reserva.fechaReserva.trim() === selectedDate)
            .map((reserva: any) => reserva.hora.slice(0, 5));

          console.log(`Hores reservades per a la data ${selectedDate}:`, reservedHours);

          const startHour = parseInt(this.serviceData.horarioInicio.split(':')[0], 10);
          const endHour = parseInt(this.serviceData.horarioFin.split(':')[0], 10);

          const allHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => `${startHour + i}:00`);
          console.log('Totes les hores possibles:', allHours);

          this.availableHours = allHours.filter((hour) => !reservedHours.includes(hour));
          console.log('Hores disponibles després del filtrat:', this.availableHours);

          if (this.availableHours.length > 0) {
            this.reservaForm.get('hora')?.enable();
          } else {
            this.reservaForm.get('hora')?.disable();
            alert('No hi ha hores disponibles per a la data seleccionada.');
          }
        },
        (error) => {
          console.error('Error al carregar les reserves:', error);
          alert('Error al carregar les reserves. Si us plau, torna-ho a intentar.');
          this.reservaForm.get('hora')?.disable();
        }
      );
    } catch (error) {
      console.error('Error inesperat:', error);
    }
  }

  createReserva(): void {
    if (this.reservaForm.invalid) {
      alert('Si us plau, completa tots els camps del formulari.');
      return;
    }

    if (!this.serviceData || !this.serviceData.identificadorFiscal) {
      console.error('Les dades del servei no estan disponibles o són incompletes:', this.serviceData);
      alert('Error: Les dades del servei no estan disponibles. Si us plau, torna-ho a intentar.');
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

    console.log('Payload del formulari:', payload);

    this.reservaStateService.createReserva(payload).subscribe(
      response => {
        console.log('Reserva creada amb èxit:', response);
        alert('Reserva creada amb èxit!');
      },
      error => {
        console.error('Error al crear la reserva:', error);
        alert('Error al crear la reserva. Si us plau, revisa les dades.');
      }
    );
  }

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }
}