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
  tempValue: string | null = null;  // Valor temporal per a l'edició
  isEditMode: boolean = false; // Determina si és mode edició

  empresaNombre: string = 'Nombre Empresa';
  servicio$!: Observable<ServicioData[]>;

  formError = '';
  nombre = '';
  descripcion = '';
  duracion = '';
  precio = '';
  horario = '';
  limiteReservas: number | null = null;
  idEmpresa!: number;

  constructor(
    private servicioState: ServiceStateService,
    private route: ActivatedRoute // Per obtenir l'ID de la URL
  ) {}

  ngOnInit(): void {
    // Obtenim l'empresa de la sessió
    const sessionStr = localStorage.getItem('session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        this.idEmpresa = session.usuario?.empresas?.idEmpresa || 0;
        const empresa = session.usuario?.empresas;
        this.empresaNombre = empresa?.actividad ?? empresa?.nombre ?? 'Nombre Empresa';
      } catch (err) {
        console.error('[ServicioFormComponent] Error parseando session:', err);
      }
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
        this.horario = `${servicio.diasLaborables} - ${servicio.horarioInicio} - ${servicio.horarioFin}`;
      } else {
        console.warn(`No s'ha trobat cap servei amb l'ID: ${id}`);
      }
    });
  }


  // Validació i enviament del formulari
  onSubmit(): void {
    if (
      !this.nombre?.trim() || // Nom no pot estar buit
      !this.descripcion?.trim() || // Descripció no pot estar buida
      !this.duracion?.trim() || // Duració no pot estar buida
      !this.horario?.trim() || // Horari no pot estar buit
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

    const payload: CreateServicePayload = {
      servicio: {
        nombre: this.nombre,
        descripcion: this.descripcion,
        duracion: this.duracion,
        precio: this.precio,
        limiteReservas: this.limiteReservas,
        horario: this.horario,
      },
      empresa: this.idEmpresa
    };
    console.log(payload); // Verificació de l'enviament de dades
    // this.servicioState.createService(payload, this.idEmpresa); // Descomentar per enviar al backend
  }

  // Funcions per a l'edició
  startEditing(field: string, currentValue: string): void {
    this.editingKey = field;
    this.tempValue = currentValue;
  }

  confirmEditing(field: string): void {
    if (this.tempValue !== null && this.tempValue.trim() !== '') {
      // Assigna el valor temporal a la propietat corresponent del component
      (this as any)[field] = this.tempValue;
    } else {
      console.warn(`El valor temporal per al camp '${field}' és buit o no vàlid.`);
    }

    // Reinicia els valors d'edició
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
    console.log('Eliminant servei amb ID:', idServicio);
    this.servicioState.deleteServicio(idServicio);
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

  validateHorario(event: Event): void {
    const input = (event.target as HTMLInputElement).value;

    // Expressió regular per validar el format HH:mm-HH:mm
    const regex = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(input)) {
      this.formError = 'El format de l\'horari és incorrecte. Usa HH:mm-HH:mm.';
      return;
    }

    // Validar que l'hora d'inici sigui anterior a l'hora de finalització
    const [start, end] = input.split('-');
    const startTime = this.parseTime(start);
    const endTime = this.parseTime(end);

    if (startTime >= endTime) {
      this.formError = 'L\'hora d\'inici ha de ser anterior a l\'hora de finalització.';
    } else {
      this.formError = ''; // Cap error
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
