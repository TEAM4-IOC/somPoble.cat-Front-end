export interface CreateEmpresaPayload {
  empresa: {
    identificadorFiscal: string;
    nombre?: string;
    actividad?: string;
    direccion: string;
    email: string;
    telefono: string;
    imagen?: File;
  };
  dni: string;
}
