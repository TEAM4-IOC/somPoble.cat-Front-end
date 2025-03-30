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
    if (!this.nombre || !this.descripcion || !this.duracion || !this.precio || this.limiteReservas === null) {
      this.formError = 'Todos los campos son obligatorios.';
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
}
