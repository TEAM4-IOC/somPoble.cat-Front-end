export interface CreateReservaPayload {
    reserva: {
      fechaReserva: string;
      hora: string;
      estado: string;
      cliente: {
        dni: string;
      };
      empresa: {
        identificadorFiscal: string;
      };
      servicio: {
        idServicio: number;
      };
    };
  }