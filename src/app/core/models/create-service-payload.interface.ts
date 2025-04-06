export interface CreateServicePayload {
    nombre: string;
    descripcion: string;
    duracion: number;
    precio: number;
    diasLaborables: string;
    limiteReservas: number;
    horarioInicio: string;
    horarioFin: string;
    identificadorFiscal: string;
}