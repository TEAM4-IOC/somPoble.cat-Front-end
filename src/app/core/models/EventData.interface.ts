export interface EventData {
  idEvento: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  fechaEvento: string;
  fechaAlta: string;
  fechaModificacion: string;
  imagenUrl: string | null;
  imagenPublicId: string | null;
}
