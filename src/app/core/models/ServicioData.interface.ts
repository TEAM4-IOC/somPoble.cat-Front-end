export interface ServicioData {
  idServicio: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  limiteReservas: number;
  fechaAltaServicio: string;
  fechaModificacionServicio: string;
  empresaId: number;
  idHorario: number;
  diasLaborables: string;
  horarioInicio: string;
  horarioFin: string;
  fechaAltaHorario: string;
  fechaModificacionHorario: string;
  identificadorFiscal: string;
}
