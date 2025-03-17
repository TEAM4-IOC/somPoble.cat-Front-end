import { BaseEmpresa } from "./base-empresa.interface";

export interface Empresario extends BaseEmpresa {
  nombre: string;
}
export interface EmpresarioData {
  empresa: Empresario;
  dni: string;
}
