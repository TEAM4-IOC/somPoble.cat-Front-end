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
  imports: [CommonModule, ReactiveFormsModule, TranslateModule ],
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
    private router: Router,
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

    // Guardar la data seleccionada en format local (YYYY-MM-DD)
    const year = day.date.getFullYear();
    const month = (day.date.getMonth() + 1).toString().padStart(2, '0'); // Mesos comencen en 0
    const dayOfMonth = day.date.getDate().toString().padStart(2, '0');
    this.selectedDate = `${year}-${month}-${dayOfMonth}`;

    console.log('Dia seleccionat:', this.selectedDate);

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

    // Convertir la data seleccionada a un objecte Date
    const selected = new Date(this.selectedDate);

    // Comparar any, mes i dia
    return (
      date.getFullYear() === selected.getFullYear() &&
      date.getMonth() === selected.getMonth() &&
      date.getDate() === selected.getDate()
    );
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
            .filter((reserva: any) => reserva.fechaReserva === selectedDate)
            .map((reserva: any) => reserva.hora.slice(0, 5));

          console.log(`Hores reservades per a la data ${selectedDate}:`, reservedHours);

          const startHour = parseInt(this.serviceData.horarioInicio.split(':')[0], 10);
          const endHour = parseInt(this.serviceData.horarioFin.split(':')[0], 10) -1;

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
    // Sincronitzar els valors dels camps amb el formulari
    if (!this.reservaForm.get('fechaReserva')?.value && this.selectedDate) {
      this.reservaForm.get('fechaReserva')?.setValue(this.selectedDate);
    }
  
    if (!this.reservaForm.get('hora')?.value && this.availableHours.length > 0) {
      this.reservaForm.get('hora')?.setValue(this.availableHours[0]); // Assignar la primera hora disponible si no hi ha cap seleccionada
    }
  
    this.reservaForm.updateValueAndValidity(); // Actualitzar l'estat del formulari
  
    // Logs per depurar
    console.log('Valor del formulari:', this.reservaForm.value);
    console.log('Estat del formulari:', this.reservaForm.valid);
    console.log('Validació de fechaReserva:', this.reservaForm.get('fechaReserva')?.valid);
    console.log('Validació de hora:', this.reservaForm.get('hora')?.valid);
  
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
        this.router.navigate(['/user-home']);
      },
      error => {
        console.error('Error al crear la reserva:', error);
        alert('Error al crear la reserva. Si us plau, revisa les dades.');
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