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

  fetchCalendarEvents: async (anio: number, mes: number): Promise<{
    anio: number;
    mes: number;
    nombreMes: string;
    nextPayrollDay: number;
    nextPayrollMonth: number;
    nextPayrollQuincenaLabel: string;
    eventos: {
      day: number;
      time: string;
      title: string;
      description: string;
      badge: string;
      eventType: 'payroll-pending' | 'pdf-dispatch' | 'payroll-completed';
    }[];
  }> => {
    const response = await axios.get(`${ENDPOINTS.NOMINA}/eventos-calendario`, {
      params: { anio, mes }
    });
    return response.data;
  },

  createEvent: async (payload: {
    titulo: string;
    subtitulo?: string;
    fechaStr: string;
    horaStr: string;
    tipoEvento: string;
    prioridad: string;
    descripcion?: string;
    adjuntoNombre?: string;
    textoAccion?: string;
  }): Promise<void> => {
    await axios.post(`${ENDPOINTS.NOMINA}/eventos`, payload);
  },

  updateEvent: async (id: number | string, payload: {
    titulo: string;
    subtitulo?: string;
    fechaStr: string;
    horaStr: string;
    tipoEvento: string;
    prioridad: string;
    descripcion?: string;
  }): Promise<void> => {
    await axios.put(`${ENDPOINTS.NOMINA}/eventos/${id}`, payload);
  },

  deleteEvent: async (id: number | string): Promise<void> => {
    await axios.delete(`${ENDPOINTS.NOMINA}/eventos/${id}`);
  },
};