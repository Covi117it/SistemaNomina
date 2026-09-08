export interface Empleado {
  codigo: string;
  nombres: string;
  tipoDocumento?: string | null;
  cedula?: string | null;
  eStatus: string;
  puesto?: string | null;
  sueldoBase?: number | null;
  fechaIngreso?: string | null;
  fechaNacimiento?: string | null;
  email?: string | null;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}