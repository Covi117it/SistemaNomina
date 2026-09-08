import axios from 'axios';
import { UserActionLog } from '../../components/user/UserActionLogsConsole';
import { ENDPOINTS } from '../../config/api';
import { 
  LoginRequest, 
  LoginResponse, 
  Usuario, 
  CrearUsuarioRequest, 
  ActualizarUsuarioRequest 
} from '../../types/usuario';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${ENDPOINTS.AUTH}/login`, credentials);
    return response.data;
  },

  // Verificar y renovar sesión persistente mediante Token
  verificarSesion: async (token: string): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${ENDPOINTS.AUTH}/verificar-sesion`, { token });
    return response.data;
  },

  // Cerrar sesión e invalidar el token en BD
  cerrarSesion: async (token?: string): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(`${ENDPOINTS.AUTH}/cerrar-sesion`, { token: token || '' });
    return response.data;
  },

  fetchUsuarios: async (): Promise<Usuario[]> => {
    const response = await axios.get<Usuario[]>(ENDPOINTS.USUARIOS);
    return response.data;
  },

  getUsuarioById: async (id: number): Promise<Usuario> => {
    const response = await axios.get<Usuario>(`${ENDPOINTS.USUARIOS}/${id}`);
    return response.data;
  },

  createUsuario: async (data: CrearUsuarioRequest): Promise<Usuario> => {
    const response = await axios.post<Usuario>(ENDPOINTS.USUARIOS, data);
    return response.data;
  },

  updateUsuario: async (id: number, data: ActualizarUsuarioRequest): Promise<Usuario> => {
    const response = await axios.put<Usuario>(`${ENDPOINTS.USUARIOS}/${id}`, data);
    return response.data;
  },

  deleteUsuario: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`${ENDPOINTS.USUARIOS}/${id}`);
    return response.data;
  },

  fetchAuditoriaUsuario: async (id: number): Promise<UserActionLog[]> => {
    const response = await axios.get<UserActionLog[]>(`${ENDPOINTS.USUARIOS}/${id}/auditoria`);
    return response.data;
  },
};