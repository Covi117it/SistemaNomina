export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: 'Admin' | 'RRHH' | 'Contador' | 'Auditor' | 'Operador' | string;
  permisosJson: string;
  activo: boolean;
  ultimoAcceso?: string;
  fechaCreacion?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  id: number;
  nombreCompleto: string;
  email: string;
  rol: string;
  permisosJson: string;
  activo: boolean;
  tokenSesion?: string | null;
}

export interface CrearUsuarioRequest {
  nombreCompleto: string;
  email: string;
  password: string;
  rol: string;
  permisosJson?: string;
}

export interface ActualizarUsuarioRequest {
  nombreCompleto: string;
  email: string;
  password?: string;
  rol: string;
  permisosJson: string;
  activo: boolean;
}