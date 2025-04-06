export interface CreateServicePayload {
    servicio: {
        nombre: string;
        descripcion: string;
        duracion: string;
        precio: string;
        diasLaborables: string;
        limiteReservas: number;
        horarioInicio: string;
        horarioFin: string;
    };
    empresa: number; //¿llegará el ID)
}