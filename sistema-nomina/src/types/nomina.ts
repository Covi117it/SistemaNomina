export interface NominaItem {
  codigoEmpleado: string;
  sueldoBase: number;
  quincena: string;
  incentivo: number;
  reembolso: number;
  horasExtras: number;
  prestamo: number;
  cuotaCumpleanos: number;
  seguroVehiculo: number;
  seguroMedico: number;
  sfs: number;
  afp: number;
  isr: number;
  totalDevengado: number;
  totalDeducciones: number;
  netoAPagar: number;
  nombreEmpleado?: string | null;
  puestoEmpleado?: string | null;
  eStatusEmpleado?: string | null;
  emailDestinatario?: string | null; 
  empleadoExiste: boolean;
}

export interface ResumenTotalesNomina {
  totalDevengado: number;
  totalDeducciones: number;
  totalNeto: number;
}

export interface PreviewNominaResponse {
  totalRegistros: number;
  codigosNoEncontrados: number;
  resumenTotales: ResumenTotalesNomina;
  items: NominaItem[];
}