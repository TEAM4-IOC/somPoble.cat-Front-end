export interface ServicioData {
    idServicio: number;
    nombre: string;
    descripcion: string;
    duracion: string;
    precio: string;
    limiteReservas: number;
    idEmpresa: number;
    fechaAlta: string;
    fechaModificacion: string;
    reservas: any[];
  }