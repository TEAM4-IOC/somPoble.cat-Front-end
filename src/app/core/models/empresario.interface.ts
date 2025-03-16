export interface Empresario {
  cif: string;
  nombre: string;
  direccion: string;
  email: string;
  telefono: string;
}

export interface EmpresarioData {
  empresa: Empresario;
  dni: string;
}
