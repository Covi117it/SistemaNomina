import axios from 'axios';
import { ENDPOINTS } from '../../config/api';

export const configApi = {
  getAvailablePeriods: async (): Promise<{ anios: any[]; meses: any[]; quincenas: any[] }> => {
    const response = await axios.get(`${ENDPOINTS.CONFIG}/periodos-disponibles`);
    return response.data;
  },

  getSmtpConfig: async (): Promise<any> => {
    const response = await axios.get(`${ENDPOINTS.CONFIG}/smtp`);
    return response.data;
  },

  saveSmtpConfig: async (config: any): Promise<void> => {
    await axios.post(`${ENDPOINTS.CONFIG}/smtp`, config);
  },
};