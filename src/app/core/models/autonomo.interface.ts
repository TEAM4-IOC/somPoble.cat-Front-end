import { BaseEmpresa } from "./base-empresa.interface";

export interface Autonomo extends BaseEmpresa {
  actividad: string;
}

export interface AutonomoData {
  autonomo: Autonomo;
  dni: string;
}
