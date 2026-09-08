import { useState } from 'react';
import { NominaItem } from '../types/nomina';
import { payrollApi } from '../service/api/payrollApi';
import { configApi } from '../service/api/configApi';

export const usePaystubEmailDispatcher = () => {
  const [sendingId, setSendingId] = useState<string | number | null>(null);
  const [sentIds, setSentIds] = useState<Set<string | number>>(new Set());
  const [isBatchSending, setIsBatchSending] = useState<boolean>(false);

  const sendSingleEmail = async (
    id: string | number,
    item: NominaItem,
    conceptoPeriodo: string
  ): Promise<boolean> => {
    if (!item.emailDestinatario) {
      alert('Este empleado no tiene un correo electrónico asignado.');
      return false;
    }

    setSendingId(id);
    try {
      const smtpConfig = await configApi.getSmtpConfig();
      await payrollApi.sendPaystubEmails({
        items: [item],
        conceptoPeriodo,
        smtpConfig,
      });
      setSentIds((prev) => new Set(prev).add(id));
      return true;
    } catch (err) {
      alert('Error al enviar el correo al empleado.');
      return false;
    } finally {
      setSendingId(null);
    }
  };

  const sendBatchEmails = async (
    items: NominaItem[],
    conceptoPeriodo: string
  ): Promise<boolean> => {
    if (!items || items.length === 0) return false;

    setIsBatchSending(true);
    try {
      const smtpConfig = await configApi.getSmtpConfig();
      await payrollApi.sendPaystubEmails({
        items,
        conceptoPeriodo,
        smtpConfig,
      });
      items.forEach((item) => {
        if (item.codigoEmpleado) {
          setSentIds((prev) => new Set(prev).add(item.codigoEmpleado));
        }
      });
      return true;
    } catch (err) {
      alert('Error al enviar los volantes por correo masivamente.');
      return false;
    } finally {
      setIsBatchSending(false);
    }
  };

  return {
    sendingId,
    sentIds,
    isBatchSending,
    sendSingleEmail,
    sendBatchEmails,
  };
};