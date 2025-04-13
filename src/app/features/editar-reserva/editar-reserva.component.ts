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

  idReserva: number | null = null; // ID de la reserva en cas d'edició
  isEditMode: boolean = true; // Sempre estem en mode edició
  isLaborableDay: boolean = true;
  diasLaborables: number[] = []; // Array per guardar els dies laborables

  // Variables per al calendari
  currentYear: number = new Date().getFullYear();
  currentMonth: number = new Date().getMonth();
  daysInMonth: { date: Date | null; isAvailable: boolean; isPast?: boolean }[] = [];
  selectedDate: string | null = null;

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
    this.route.queryParams.subscribe(params => {
      console.log('Paràmetres rebuts:', params); // Log per depurar els paràmetres
  
      this.idReserva = params['idReserva'] ? +params['idReserva'] : null;
      const identificadorFiscal = params['identificadorFiscal'];
      const idServicio = +params['idServicio'];
  
      if (!this.idReserva || !identificadorFiscal || !idServicio) {
        console.error('Falten paràmetres necessaris: idReserva, identificadorFiscal o idServicio');
        alert('Falten paràmetres necessaris per carregar el servei.');
        this.router.navigate(['/gestor-reserves-cli']);
        return;
      }
  
      // Carregar la reserva existent
      this.carregarReserva(this.idReserva);
  
      // Carregar les dades del servei
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
        this.onDateChange(reserva.fechaReserva); // Carregar hores disponibles
      },
      (error) => {
        console.error('Error al carregar la reserva:', error);
        alert('Error al carregar la reserva. Si us plau, torna-ho a intentar.');
        this.router.navigate(['/gestor-reserves-cli']);
      }
    );
  }
  
  carregarDadesDelServei(identificadorFiscal: string, idServicio: number): void {
    this.serviceStateService.getServicioHorarioById(identificadorFiscal, idServicio).subscribe(
      data => {
        this.serviceData = data;
        console.log('Dades del servei carregades:', this.serviceData);
  
        // Processar `diasLaborables` des de `serviceData`
        if (this.serviceData.diasLaborables) {
          this.diasLaborables = this.serviceData.diasLaborables
            .split(',')
            .map((dia: string) => parseInt(dia.trim(), 10));
        } else {
          console.error('Error: `diasLaborables` no està disponible.');
          this.diasLaborables = []; // Inicialitzar com a buit si no està disponible
        }
  
        this.setupAvailableDatesAndHours();
        this.generateCalendar();
      },
      error => {
        console.error('Error al carregar les dades del servei:', error);
        alert('Error al carregar les dades del servei. Si us plau, torna-ho a intentar.');
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
    this.availableHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => `${startHour + i}:00`);
  }

  generateCalendar(): void {
    if (!this.serviceData || !this.serviceData.diasLaborables) {
      console.error('Error: serviceData o diasLaborables no està inicialitzat.');
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
      console.error('Error: serviceData no està inicialitzat.');
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
      console.error('Error: serviceData no està inicialitzat.');
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
      alert('Selecciona una data vàlida.');
      return;
    }

    
  
    // Carregar hores disponibles segons la data seleccionada
    this.reservaStateService.getReservasByEmpresa(this.route.snapshot.queryParams['identificadorFiscal']).subscribe(
      (reservas) => {
        const reservedHours = reservas
          .filter((reserva: any) => reserva.fechaReserva === selectedDate)
          .map((reserva: any) => reserva.hora.slice(0, 5));
  
        const startHour = parseInt(this.serviceData.horarioInicio.split(':')[0], 10);
        const endHour = parseInt(this.serviceData.horarioFin.split(':')[0], 10);
  
        const allHours = Array.from({ length: endHour - startHour + 1 }, (_, i) => `${startHour + i}:00`);
        this.availableHours = allHours.filter((hour) => !reservedHours.includes(hour));
  
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
      }
    );
  }

  onSubmit(): void {
    if (this.reservaForm.invalid) {
      alert('Si us plau, completa tots els camps del formulari.');
      return;
    }

    const payload = {
      fechaReserva: this.reservaForm.value.fechaReserva,
      hora: this.reservaForm.value.hora
    };

    this.reservaStateService.updateReserva(this.idReserva!, payload).subscribe(
      () => {
        alert('Reserva actualitzada correctament!');
        this.router.navigate(['/gestor-reserves-cli']);
      },
      (error) => {
        console.error('Error al actualitzar la reserva:', error);
        alert('Error al actualitzar la reserva. Si us plau, torna-ho a intentar.');
      }
    );
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