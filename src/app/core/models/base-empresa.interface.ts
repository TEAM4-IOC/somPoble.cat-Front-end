import { AutonomoData } from "./autonomo.interface";
import { EmpresarioData } from "./empresario.interface";

export interface BaseEmpresa {
  identificadorFiscal: string;
  direccion: string;
  email: string;
  telefono: string;
}

export type EmpresaData = EmpresarioData | AutonomoData;
