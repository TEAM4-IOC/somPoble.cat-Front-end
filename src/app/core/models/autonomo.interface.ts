export interface Autonomo {
  dniAutonomo: string;
  actividad: string;
  direccion: string;
  email: string;
  telefono: string;
}

export interface AutonomoData {
  autonomo: Autonomo;
  dni: string;
}
