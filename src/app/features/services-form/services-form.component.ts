import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { CreateServicePayload } from '../../core/models/create-service-payload.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '../../core/services/i18n.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesFormComponent implements OnInit {
  idServicio: number | null = null;
  editingKey: string | null = null;
  tempValue: string = '';
  isEditMode: boolean = false;

  empresaNombre: string = 'Nombre Empresa';
  servicio$!: Observable<ServicioData[]>;

  formError = '';
  nombre = '';
  descripcion = '';
  duracion = '';
  precio = '';
  diasLaborables: number[] = [];
  horarioInicio = '';
  horarioFin = '';
  limiteReservas: number | null = null;
  idEmpresa!: number;

  weekDays: { value: number; key: string }[] = [];

  constructor(
    private servicioState: ServiceStateService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {

    this.weekDays = [
      { value: 1, key: 'add-services-form.monday' },
      { value: 2, key: 'add-services-form.tuesday' },
      { value: 3, key: 'add-services-form.wednesday' },
      { value: 4, key: 'add-services-form.thursday' },
      { value: 5, key: 'add-services-form.friday' },
      { value: 6, key: 'add-services-form.saturday' },
      { value: 7, key: 'add-services-form.sunday' }
    ];

    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);

        const empresa = session.usuario?.empresas?.[0];
        this.identificadorFiscal = empresa?.identificadorFiscal || '';

        this.idEmpresa = empresa?.idEmpresa || 0;
        this.empresaNombre = empresa?.actividad ?? empresa?.nombre ?? 'Nombre Empresa';
      } catch (err) {
        console.error('[ServicioFormComponent] Error parseando session:', err);
      }
    }

    this.servicioState.loadServicios();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idServicio = +params['id'];
        this.isEditMode = true;
        this.loadServicio(this.idServicio);
      } else {
        this.isEditMode = false;
      }
    });

    this.servicio$ = this.servicioState.service$;
  }

  onDaySelected(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const dayValue = +checkbox.value;

    if (checkbox.checked) {
      this.diasLaborables.push(dayValue);
    } else {
      this.diasLaborables = this.diasLaborables.filter(d => d !== dayValue);
    }
  }

  public identificadorFiscal: string = '';
  loadServicio(id: number): void {
    this.servicioState.getServicioById(id).subscribe(servicio => {
      if (servicio) {
        this.nombre = servicio.nombre;
        this.descripcion = servicio.descripcion;
        this.duracion = servicio.duracion.toString();
        this.precio = servicio.precio.toString();
        this.limiteReservas = servicio.limiteReservas;
        this.horarioInicio = servicio.horarioInicio.substring(0, 5);
        this.horarioFin = servicio.horarioFin.substring(0, 5);

        this.diasLaborables = servicio.diasLaborables
          ? servicio.diasLaborables.split(',').map(Number)
          : [];

        this.identificadorFiscal = servicio.identificadorFiscal;
      } 
    });
  }

  validateDuracion(): void {
    const duracionNumerica = parseInt(this.duracion, 10);

    if (isNaN(duracionNumerica) || duracionNumerica <= 0) {
      this.formError = this.translate.instant('add-services-form.durationGreaterThanZeroError');      return;
      return;
    }

    if (duracionNumerica > 60) {
      this.formError = this.translate.instant('add-services-form.durationError');      
      this.duracion = '60';
    } else {
      this.formError = '';
    }
  }

  validateDuracionEdit(): void {
    const duracionNumerica = parseInt(this.tempValue, 10);

    if (isNaN(duracionNumerica) || duracionNumerica <= 0) {
      this.formError = this.translate.instant('add-services-form.durationGreaterThanZeroError');      return;
    }

    if (duracionNumerica > 60) {
      this.formError = this.translate.instant('add-services-form.durationError');      
      this.tempValue = '60';
    } else {
      this.formError = '';
    }
  }

  validateTimeRange(): boolean {
    const startTime = this.parseTime(this.horarioInicio);
    const endTime = this.parseTime(this.horarioFin);

    if (endTime <= startTime) {
      this.formErrorHorarioInicio = this.translate.instant('add-services-form.endTimeError');      return false;
    }

    this.formErrorHorarioInicio = '';
    this.calculateMaxReservations();
    return true;
  }

  validateTimeRangeEdit(startTime: string, endTime: string, field: string): void {
    const startMinutes = this.parseTime(startTime);
    const endMinutes = this.parseTime(endTime);

    if (endMinutes <= startMinutes) {
      this.formErrorHorarioInicio = this.translate.instant('add-services-form.endTimeError');      if (field === 'horarioInicio') {
        this.tempValue = startTime;
      } else if (field === 'horarioFin') {
        this.tempValue = endTime;
      }
    } else {
      this.formErrorHorarioInicio = '';
    }
  }

  calculateMaxReservations(): void {
    const startMinutes = this.parseTime(this.horarioInicio);
    const endMinutes = this.parseTime(this.horarioFin);

    if (endMinutes > startMinutes) {
      const totalHours = (endMinutes - startMinutes) / 60;
      this.limiteReservas = Math.floor(totalHours);
    } else {
      this.limiteReservas = null;
    }
  }

  onSubmit(): void {

    const regex = /^([01]\d|2[0-3]):00$/;

    if (!regex.test(this.horarioInicio)) {
      this.formErrorHorarioInicio = this.translate.instant('add-services-form.timeFormatError');      return;
    }

    if (!regex.test(this.horarioFin)) {
      this.formErrorHorarioInicio = this.translate.instant('add-services-form.timeFormatError');      return;
    }

    if (!this.validateTimeRange()) {
      return;
    }

    this.formErrorHorarioInicio = '';

    if (
      !this.nombre?.trim() ||
      !this.descripcion?.trim() ||
      !this.duracion?.trim() ||
      !this.horarioInicio?.trim() ||
      !this.horarioFin?.trim() ||
      this.precio === null ||
      this.precio === undefined ||
      this.limiteReservas === null ||
      this.limiteReservas === undefined ||
      this.limiteReservas <= 0 ||
      this.precio === ''
    ) {
      this.formError = this.translate.instant('add-services-form.formError');      return;
    }
    this.formError = '';

    const payload = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      duracion: +this.duracion,
      precio: parseFloat(this.precio),
      limiteReservas: this.limiteReservas,
      diasLaborables: this.diasLaborables.join(','),
      horarioInicio: this.horarioInicio,
      horarioFin: this.horarioFin,
      identificadorFiscal: this.identificadorFiscal
    };


    if (this.isEditMode && this.idServicio !== null) {

      this.servicioState.updateService(this.idServicio, payload, this.identificadorFiscal).subscribe(
        () => {
          alert(this.translate.instant('add-services-form.updateOK'));
          this.router.navigate(['/espai-empresa']);
        },
        (error) => {
          alert(this.translate.instant('add-services-form.updateKO'));
        }
      );
    } else {
      this.servicioState.createService(payload).subscribe(
        () => {
          alert(this.translate.instant('add-services-form.createOK'));
          this.router.navigate(['/espai-empresa']);
        },
        (error) => {
          alert(this.translate.instant('add-services-form.createKO'));
        }
      );
    }
  }

  startEditing(field: string, currentValue: string): void {
    this.editingKey = field;
    this.tempValue = currentValue;
  }

  confirmEditing(field: string): void {
    if (this.tempValue !== null && this.tempValue.trim() !== '') {
      if (field === 'diasLaborables') {
      } else {
        (this as any)[field] = this.tempValue;
      }

      if (field === 'horarioInicio' || field === 'horarioFin') {
        this.calculateMaxReservations();
      }
    }

    this.editingKey = null;
    this.tempValue = '';
  }

  cancelEditing(): void {
    this.editingKey = null;
    this.tempValue = '';
  }

  editingField(field: string): boolean {
    return this.editingKey === field;
  }

  public deleteServicio(idServicio: number): void {

    const confirmDelete = confirm(
      this.translate.instant('horaris-empresa.confirmDelete')
    );
  
    if (!confirmDelete) {
      return;
    }

    if (!this.identificadorFiscal) {
      return;
    }
  
    this.servicioState.deleteServicio(idServicio, this.identificadorFiscal).subscribe(
      () => {
        alert(this.translate.instant('add-services-form.deleteOK'));
        this.router.navigate(['/espai-empresa']);
      },
      (error) => {
        alert(this.translate.instant('add-services-form.deleteKO'));
      }
    );
  }

  validatePrecio(event: KeyboardEvent): void {
    const inputChar = event.key;
    const currentValue = this.precio ?? '';

    if (
      !/^\d$/.test(inputChar) &&
      inputChar !== '.' &&
      inputChar !== ',' &&
      inputChar !== 'Backspace' &&
      inputChar !== 'ArrowLeft' &&
      inputChar !== 'ArrowRight'
    ) {
      event.preventDefault();
      return;
    }
    if (inputChar === 'Backspace') {
      return;
    }
    if (inputChar === '.' && currentValue.includes('.')) {
      event.preventDefault();
      return;
    }
    if (currentValue.includes('.') && currentValue.split('.')[1].length >= 2) {
      event.preventDefault();
    }
  }

  restrictToTimeFormat(event: KeyboardEvent): void {
    const inputChar = event.key;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', ':'];

    if (!/^\d$/.test(inputChar) && !allowedKeys.includes(inputChar)) {
      event.preventDefault();
      return;
    }

    const currentValue = (event.target as HTMLInputElement).value;

    if (inputChar === ':' && currentValue.includes(':')) {
      event.preventDefault();
      return;
    }

    if (currentValue.includes(':') && inputChar !== '0' && inputChar !== 'Backspace') {
      event.preventDefault();
    }
  }

  formErrorHorarioInicio: string = '';

  validateHorario(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const regex = /^([01]\d|2[0-3]):00$/;

    if (!regex.test(input) && input.length === 5) {
      this.formErrorHorarioInicio = this.translate.instant('add-services-form.timeFormatError');    } else {
      this.formErrorHorarioInicio = '';
      this.calculateMaxReservations();
    }
  }

  parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onInputChange(event: any): void {
    let inputValue = event.target.value.replace(',', '.');
    const [integer, decimal] = inputValue.split('.');

    if (decimal && decimal.length > 2) {
      inputValue = `${integer}.${decimal.substring(0, 2)}`;
    }
    this.precio = inputValue;
  }

  goToEspaiClient(): void {
    this.router.navigate(['/espai-empresa']);
  }

}
