import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { CreateServicePayload } from '../../core/models/create-service-payload.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './services-form.component.html',
  styleUrls: ['./services-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesFormComponent implements OnInit {
  idServicio: number | null = null; // ID del servei obtingut de la URL
  editingKey: string | null = null; // Camp en edició
  tempValue: string = '';  // Valor temporal per a l'edició
  isEditMode: boolean = false; // Determina si és mode edició

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

  // Días de la semana con valores numéricos y claves de traducción
  weekDays: { value: number; key: string }[] = [];

  constructor(
    private servicioState: ServiceStateService,
    private route: ActivatedRoute // Per obtenir l'ID de la URL
  ) { }

  ngOnInit(): void {

    // Inicializar los días de la semana
    this.weekDays = [
      { value: 1, key: 'add-services-form.monday' },
      { value: 2, key: 'add-services-form.tuesday' },
      { value: 3, key: 'add-services-form.wednesday' },
      { value: 4, key: 'add-services-form.thursday' },
      { value: 5, key: 'add-services-form.friday' },
      { value: 6, key: 'add-services-form.saturday' },
      { value: 7, key: 'add-services-form.sunday' }
    ];
    // Obtenim l'empresa de la sessió
const sessionStr = localStorage.getItem('session');
if (sessionStr) {
  try {
    const session = JSON.parse(sessionStr);
    console.log('Sessió carregada:', session);

    // Extraer el identificador fiscal del primer elemento del array `empresas`
    const empresa = session.usuario?.empresas?.[0]; // Acceder al primer elemento del array
    this.identificadorFiscal = empresa?.identificadorFiscal || ''; // Asegúrate de que este campo exista
    console.log('Identificador Fiscal cargado desde la sesión:', this.identificadorFiscal);

    // Extraer otros datos de la empresa
    this.idEmpresa = empresa?.idEmpresa || 0;
    this.empresaNombre = empresa?.actividad ?? empresa?.nombre ?? 'Nombre Empresa';
  } catch (err) {
    console.error('[ServicioFormComponent] Error parseando session:', err);
  }
} else {
  console.warn('No se encontró ninguna sesión en el almacenamiento local.');
}

    // Carreguem els serveis inicialment
    this.servicioState.loadServicios();

    // Obtenim l'ID de la URL i carreguem el servei
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.idServicio = +params['id'];
        this.isEditMode = true; // Activem el mode edició
        this.loadServicio(this.idServicio);
      } else {
        console.warn('No s\'ha especificat cap ID a la URL.');
        this.isEditMode = false; // Mode creació
      }
    });

    // Assignem l'observable dels serveis
    this.servicio$ = this.servicioState.service$;
  }

  //A descomentar cuando días Laborables esté por check
  onDaySelected(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const dayValue = +checkbox.value; // Convertimos el valor a número

    if (checkbox.checked) {
      // Agregar el día seleccionado al array
      this.diasLaborables.push(dayValue);
    } else {
      // Eliminar el día deseleccionado del array
      this.diasLaborables = this.diasLaborables.filter(d => d !== dayValue);
    }

    console.log('Días laborables seleccionados:', this.diasLaborables);
  }

  public identificadorFiscal: string = ''; // Nueva propiedad para almacenar el identificador fiscal
  // Mètode per carregar el servei
  loadServicio(id: number): void {
    this.servicioState.getServicioById(id).subscribe(servicio => {
      if (servicio) {
        console.log('Servei carregat:', servicio);
        this.nombre = servicio.nombre;
        this.descripcion = servicio.descripcion;
        this.duracion = servicio.duracion.toString();
        this.precio = servicio.precio.toString();
        this.limiteReservas = servicio.limiteReservas;
        this.horarioInicio = servicio.horarioInicio.substring(0, 5);
      this.horarioFin = servicio.horarioFin.substring(0, 5);

        this.diasLaborables = servicio.diasLaborables
          ? servicio.diasLaborables.split(',').map(Number) // Convierte "1,2,3" a [1, 2, 3]
          : [];

        console.log('Días laborables cargados:', this.diasLaborables);

        // Capturamos el identificador fiscal del servicio
        this.identificadorFiscal = servicio.identificadorFiscal; // Asegúrate de que este campo exista en el modelo
        console.log('Identificador Fiscal del servicio:', this.identificadorFiscal);
      } else {
        console.warn(`No s'ha trobat cap servei amb l'ID: ${id}`);
      }
    });
  }

  validateDuracion(): void {
    const duracionNumerica = parseInt(this.duracion, 10);
  
    if (isNaN(duracionNumerica) || duracionNumerica <= 0) {
      this.formError = 'La duración debe ser un número mayor a 0.';
      return;
    }
  
    if (duracionNumerica > 60) {
      this.formError = 'La duración no puede ser mayor a 60 minutos.';
      this.duracion = '60'; // Ajustar automáticamente a 60 si excede el límite
    } else {
      this.formError = ''; // Limpia el error si la duración es válida
    }
  }

  validateDuracionEdit(): void {
    const duracionNumerica = parseInt(this.tempValue, 10);
  
    if (isNaN(duracionNumerica) || duracionNumerica <= 0) {
      this.formError = 'La duración debe ser un número mayor a 0.';
      return;
    }
  
    if (duracionNumerica > 60) {
      this.formError = 'La duración no puede ser mayor a 60 minutos.';
      this.tempValue = '60'; // Ajustar automáticamente a 60 si excede el límite
    } else {
      this.formError = ''; // Limpia el error si la duración es válida
    }
  }

  validateTimeRange(): boolean {
    const startTime = this.parseTime(this.horarioInicio);
    const endTime = this.parseTime(this.horarioFin);
  
    if (endTime <= startTime) {
      this.formErrorHorarioInicio = 'La hora de fin debe ser posterior a la hora de inicio.';
      return false;
    }
  
    this.formErrorHorarioInicio = '';
    this.calculateMaxReservations(); // Recalcular el límite de reservas
    return true;
  }

  validateTimeRangeEdit(startTime: string, endTime: string, field: string): void {
    const startMinutes = this.parseTime(startTime);
    const endMinutes = this.parseTime(endTime);
  
    if (endMinutes <= startMinutes) {
      this.formErrorHorarioInicio = 'La hora de fin debe ser posterior a la hora de inicio.';
      if (field === 'horarioInicio') {
        this.tempValue = startTime; // Restaurar el valor temporal si es inválido
      } else if (field === 'horarioFin') {
        this.tempValue = endTime; // Restaurar el valor temporal si es inválido
      }
    } else {
      this.formErrorHorarioInicio = ''; // Limpia el error si la validación es correcta
    }
  }

  calculateMaxReservations(): void {
    const startMinutes = this.parseTime(this.horarioInicio);
    const endMinutes = this.parseTime(this.horarioFin);
  
    if (endMinutes > startMinutes) {
      const totalHours = (endMinutes - startMinutes) / 60; // Diferencia en horas
      this.limiteReservas = Math.floor(totalHours); // Una reserva por hora
    } else {
      this.limiteReservas = null; // Si las horas no son válidas, no se puede calcular
    }
  }


  // Validació i enviament del formulari
  onSubmit(): void {

    const regex = /^([01]\d|2[0-3]):00$/; // Valida format HH:00

    if (!regex.test(this.horarioInicio)) {
      this.formErrorHorarioInicio = 'El formato debe ser HH:00 (ejemplo: 09:00).';
      return; // Detener el envío del formulario
    }
  
    if (!regex.test(this.horarioFin)) {
      this.formErrorHorarioInicio = 'El formato debe ser HH:00 (ejemplo: 18:00).';
      return; // Detener el envío del formulario
    }
  
    if (!this.validateTimeRange()) {
      return; // Detener el envío del formulario si la validación de rango falla
    }

    // Si no hay errores, limpia el mensaje de error
    this.formErrorHorarioInicio = '';

    if (
      !this.nombre?.trim() || // Nom no pot estar buit
      !this.descripcion?.trim() || // Descripció no pot estar buida
      !this.duracion?.trim() || // Duració no pot estar buida
      !this.horarioInicio?.trim() || // Horari no pot estar buit
      !this.horarioFin?.trim() || // Horari no pot estar buit
      this.precio === null ||
      this.precio === undefined ||
      this.limiteReservas === null ||
      this.limiteReservas === undefined ||
      this.limiteReservas <= 0 || // Límit de reserves ha de ser > 0
      this.precio === '' // Preu no pot estar buit
    ) {
      this.formError = 'add-services-form.formError';
      console.log(this.formError);
      return;
    }
    this.formError = '';

    console.log('Identificador Fiscal obtenido de la sesión:', this.identificadorFiscal);


    const payload = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      duracion: +this.duracion, // Convertir a número
      precio: parseFloat(this.precio), // Convertir a número flotante
      limiteReservas: this.limiteReservas,
      diasLaborables: this.diasLaborables.join(','), // Enviar tal cual llega como string
      horarioInicio: this.horarioInicio,
      horarioFin: this.horarioFin,
      identificadorFiscal: this.identificadorFiscal
    };
    console.log('Payload generado:', payload); // Verificació de l'enviament de dades


    if (this.isEditMode && this.idServicio !== null) {
    // Modo edición: actualizar el servicio
    this.servicioState.updateService(this.idServicio, payload, this.identificadorFiscal).subscribe(
      response => {
        console.log('Servicio actualizado correctamente:', response);
      },
      error => {
        console.error('Error al actualizar el servicio:', error);
      }
    );
  } else {
    // Modo creación: crear un nuevo servicio
    this.servicioState.createService(payload).subscribe(
      response => {
        console.log('Servicio creado correctamente:', response);
      },
      error => {
        console.error('Error al crear el servicio:', error);
      }
    );
  }



  }

  // Funcions per a l'edició
  startEditing(field: string, currentValue: string): void {
    this.editingKey = field;
    this.tempValue = currentValue;
  }

  confirmEditing(field: string): void {
    if (this.tempValue !== null && this.tempValue.trim() !== '') {
      if (field === 'diasLaborables') {
        // No usamos tempValue directamente, ya que los checkboxes ya actualizan el array diasLaborables
        console.log('Días laborables confirmados:', this.diasLaborables);
      } else {
        // Asigna el valor temporal a la propiedad correspondiente del componente
        (this as any)[field] = this.tempValue;
      }
  
      // Recalcular el límite de reservas si se editan los horarios
      if (field === 'horarioInicio' || field === 'horarioFin') {
        this.calculateMaxReservations();
      }
    } else {
      console.warn(`El valor temporal para el campo '${field}' es vacío o no válido.`);
    }
  
    // Reinicia los valores de edición
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

  // Mètode per eliminar un servei
  public deleteServicio(idServicio: number): void {
    if (!this.identificadorFiscal) {
      console.error('El identificador fiscal no está definido.');
      return;
    }

    console.log('Intentando eliminar el servicio con los siguientes datos:');
    console.log('ID del servicio:', idServicio);
    this.servicioState.deleteServicio(idServicio, this.identificadorFiscal);
  }

  // Validacions del camp preu
  validatePrecio(event: KeyboardEvent): void {
    const inputChar = event.key;
    const currentValue = this.precio ?? '';

    if (
      !/^\d$/.test(inputChar) && // Només números
      inputChar !== '.' && // Permetre el punt decimal
      inputChar !== ',' && // Permetre la coma
      inputChar !== 'Backspace' && // Permetre esborrar
      inputChar !== 'ArrowLeft' && // Permetre fletxes
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
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', ':']; // Teclas permitidas

    // Permitir solo números, dos puntos y teclas de navegación
    if (!/^\d$/.test(inputChar) && !allowedKeys.includes(inputChar)) {
      event.preventDefault();
      return;
    }

    const currentValue = (event.target as HTMLInputElement).value;

    // Validar que no haya más de un carácter `:` en el campo
    if (inputChar === ':' && currentValue.includes(':')) {
      event.preventDefault();
      return;
    }

    // Restringir los minutos a "00" si ya se ha escrito el carácter `:`
    if (currentValue.includes(':') && inputChar !== '0' && inputChar !== 'Backspace') {
      event.preventDefault();
    }
  }

  formErrorHorarioInicio: string = ''; // Variable para almacenar el mensaje de error

  validateHorario(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    const regex = /^([01]\d|2[0-3]):00$/; // Valida formato HH:00
  
    if (!regex.test(input) && input.length === 5) {
      this.formErrorHorarioInicio = 'El formato debe ser HH:00 (ejemplo: 09:00).';
    } else {
      this.formErrorHorarioInicio = ''; // Limpia el error si el formato es válido
      this.calculateMaxReservations(); // Recalcular el límite de reservas
    }
  }

  parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes; // Convertir hores i minuts a minuts totals
  }

  onInputChange(event: any): void {
    let inputValue = event.target.value.replace(',', '.');
    const [integer, decimal] = inputValue.split('.');

    if (decimal && decimal.length > 2) {
      inputValue = `${integer}.${decimal.substring(0, 2)}`;
    }
    this.precio = inputValue;
  }


}
