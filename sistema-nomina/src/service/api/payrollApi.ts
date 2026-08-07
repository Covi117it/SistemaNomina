import axios from 'axios';
import { PreviewNominaResponse, NominaItem } from '../../types/nomina';
import { ENDPOINTS } from '../../config/api';

export const payrollApi = {
  uploadPreview: async (file: File): Promise<PreviewNominaResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post<PreviewNominaResponse>(`${ENDPOINTS.NOMINA}/preview-quincena`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  processAndSaveQuincena: async (
    mes: number,
    quincena: string,
    concepto: string,
    items: NominaItem[]
  ): Promise<void> => {
    await axios.post(
      `${ENDPOINTS.NOMINA}/procesar-quincena?mes=${mes}&quincena=${quincena}&concepto=${encodeURIComponent(concepto)}`,
      items
    );
  },

  fetchHistory: async (params: {
    anio?: string;
    mes?: string | null;
    quincena?: string | null;
    search?: string | null;
  }): Promise<any[]> => {
    const response = await axios.get(`${ENDPOINTS.NOMINA}/historico`, { params });
    return response.data;
  },

  sendPaystubEmails: async (payload: {
    items: NominaItem[];
    conceptoPeriodo: string;
    smtpConfig: any;
  }): Promise<void> => {
    await axios.post(`${ENDPOINTS.NOMINA}/enviar-volantes-correo`, payload);
  },

  fetchPeriodoSugerido: async (): Promise<{ quincena: string; mes: number; concepto: string }> => {
    const response = await axios.get(`${ENDPOINTS.NOMINA}/periodo-sugerido`);
    return response.data;
  },

  recalcularNomina: async (items: NominaItem[]): Promise<{ items: NominaItem[]; resumenTotales: { totalDevengado: number; totalDeducciones: number; totalNeto: number } }> => {
    const response = await axios.post(`${ENDPOINTS.NOMINA}/recalcular`, items);
    return response.data;
  },
};