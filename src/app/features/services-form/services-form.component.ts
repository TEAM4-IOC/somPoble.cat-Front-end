import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ServiceStateService } from '../../core/services/service-state.service';
import { ServicioData } from '../../core/models/ServicioData.interface';
import { CreateServicePayload } from '../../core/models/create-service-payload.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-services-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule],
  templateUrl: './services-form.component.html',
  styleUrl: './services-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesFormComponent implements OnInit {
  
  empresaNombre: string = 'Nombre Empresa';
  servicio$!: Observable<ServicioData[]>;
  
  formError = '';
  nombre = '';
  descripcion = '';
  duracion = '';
  precio = '';
  horario = '';
  limiteReservas: number | null = null;
  idEmpresa! : number;

  editingKey: string | null = null;
  tempValue = '';

  constructor(private servicioState: ServiceStateService) {}

  ngOnInit(): void {
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

    if (this.idEmpresa) {
      this.servicioState.loadServiciosByEmpresaId(this.idEmpresa);
    }

    this.servicio$ = this.servicioState.service$;
  }

  onSubmit(): void {
    if (
      !this.nombre?.trim() || 
      !this.descripcion?.trim() || 
      !this.duracion?.trim() || 
      !this.horario?.trim() ||
      this.precio === null || 
      this.precio === undefined || 
      this.limiteReservas === null || 
      this.limiteReservas === undefined ||
      this.limiteReservas <= 0 ||
      this.precio === ''
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
    console.log(payload); // Verificación envío datos FORM
    //this.servicioState.createService(payload, this.idEmpresa);     --> A descomentar
  }

  startEditing(field: string, currentValue: string): void {
    this.editingKey = field;
    this.tempValue = currentValue;
  }

  confirmEditing(field: string): void {
    this.servicioState.updateServiceField({ [field]: this.tempValue });
    this.editingKey = null;
    this.tempValue = '';
  }

  cancelEditing(): void {
    this.editingKey = null;
    this.tempValue = '';
  }

  deleteServicio(idServicio: number): void {
    this.servicioState.deleteService(idServicio);
  }

  editingField(field: string): boolean {
    return this.editingKey === field;
  }

  //Validaciones campo precio
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
  
  onInputChange(event: any): void {
    let inputValue = event.target.value.replace(',', '.');
    const [integer, decimal] = inputValue.split('.');
  
    if (decimal && decimal.length > 2) {
      inputValue = `${integer}.${decimal.substring(0, 2)}`;
    }
    this.precio = inputValue;
  }
}
