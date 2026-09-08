import React from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface SendPaystubButtonProps {
  onSend: () => void | Promise<void>;
  isSending?: boolean;
  isSent?: boolean;
  hasEmail?: boolean;
}

export const SendPaystubButton: React.FC<SendPaystubButtonProps> = ({
  onSend,
  isSending = false,
  isSent = false,
  hasEmail = true,
}) => {
  return (
    <button
      onClick={onSend}
      disabled={isSending || !hasEmail}
      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer border shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
        isSent
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
      }`}
      title={
        !hasEmail
          ? 'El empleado no tiene correo registrado'
          : isSent
          ? 'Comprobante enviado'
          : 'Reenviar comprobante por correo a este empleado'
      }
    >
      {isSending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
      ) : isSent ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Enviado
        </>
      ) : (
        <>
          <Mail className="w-3.5 h-3.5" />
          Enviar
        </>
      )}
    </button>
  );
};