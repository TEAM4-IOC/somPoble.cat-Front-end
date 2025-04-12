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
      hora: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Recuperar el DNI del client des de la sessió
    const sessionStr = localStorage.getItem('session'); // Canviem a localStorage
  console.log('GUARDADO SESION:', sessionStr);
  if (sessionStr) {
    const session = JSON.parse(sessionStr);
    const cliente = session.usuario;
    this.dniCliente = cliente?.dni || ''; // Guardar el DNI del client
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
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // Dia de la setmana del primer dia del mes (0 = diumenge)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    const laborableDays = this.serviceData.diasLaborables.split(',').map((dia: string) => parseInt(dia.trim(), 10));
    const today = new Date(); // Data actual
    today.setHours(0, 0, 0, 0); // Eliminar hores per comparar només dates
  
    this.daysInMonth = [];
  
    // Afegir dies buits per ajustar el primer dia del mes
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      this.daysInMonth.push({ date: null, isAvailable: false });
    }
  
    // Afegir els dies del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay(); // 0 = diumenge, 1 = dilluns, etc.
  
      // Comprovar si el dia és laborable
      const isLaborable = laborableDays.includes(dayOfWeek);
  
      // Comprovar si el dia és anterior a avui
      const isPast = date < today;
  
      this.daysInMonth.push({
        date,
        isAvailable: isLaborable && !isPast, // Només disponible si és laborable i no és passat
        isPast // Afegim una propietat per identificar dies passats
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

  selectDate(day: { date: Date | null; isAvailable: boolean }): void {
    if (day.date) {
      // Actualitzar la data seleccionada
      this.selectedDate = day.date.toISOString().split('T')[0];
      // Actualitzar el valor del formulari
      this.reservaForm.get('fechaReserva')?.setValue(this.selectedDate);
    }
  }

  onDateChange(event: Event): void {
    const selectedDate = (event.target as HTMLInputElement).value;
    const dayOfWeek = new Date(selectedDate).getDay(); // Obtenir el dia de la setmana (0 = diumenge, 1 = dilluns, etc.)

    const laborableDays = this.serviceData.diasLaborables.split(',').map((dia: string) => parseInt(dia.trim(), 10));

    this.isLaborableDay = laborableDays.includes(dayOfWeek);

    if (!this.isLaborableDay) {
      alert('El dia seleccionat no és laborable per a aquest servei.');
      this.reservaForm.get('fechaReserva')?.setValue(''); // Restablir el valor del camp
    }
  }

  mapDayToNumber(day: string): number {
    const daysMap: { [key: string]: number } = {
      'Lunes': 1,
      'Martes': 2,
      'Miércoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'Sábado': 6,
      'Domingo': 0
    };
    return daysMap[day] ?? -1;
  }

  createReserva(): void {
    if (this.reservaForm.invalid) {
      alert('Si us plau, completa tots els camps del formulari.');
      return;
    }

    // Validar que serviceData i les seves propietats existeixen
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