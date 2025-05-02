export interface MonthlyMetrics {
  mes: string;
  reservas: number;
  ingresos: number;
}

export interface Metrics {
  nombreEmpresa: string;
  totalReservas: number;
  totalIngresos: number;
  clientesUnicos: number;
  mensual: MonthlyMetrics[];
}
