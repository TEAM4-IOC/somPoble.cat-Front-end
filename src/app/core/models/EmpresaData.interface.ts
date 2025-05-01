export interface EmpresaData {
  idEmpresa: number;
  identificadorFiscal: string;
  nombre: string | null;
  actividad: string | null;
  direccion: string;
  email: string;
  telefono: string;
  tipo: number;
  fechaAlta: string;
  fechaModificacion: string;
  reservas: any[];
  servicios: any[];
  horarios: any[];
  imagenUrl: string | null;
  imagenPublicId: string | null;
}
