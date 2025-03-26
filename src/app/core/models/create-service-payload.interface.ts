export interface CreateServicePayload {
    servicio: {
        nombre: string;
        descripcion: string;
        duracion: string;
        precio: string;
        limiteReservas: number;
        horario: string; //Por definir
    };
    empresa: number; //¿llegará el ID)
}