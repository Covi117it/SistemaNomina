import React, { useState, useEffect } from 'react';
import { Server } from 'lucide-react';
import axios from 'axios';

interface SmtpConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const SmtpConfigModal: React.FC<SmtpConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [smtpConfig, setSmtpConfig] = useState({
    server: 'smtp.gmail.com',
    port: 587,
    senderEmail: '',
    senderName: 'Nómina Enfoco Institucional',
    password: '',
    enableSsl: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:5289/api/config/smtp')
        .then((res) => {
          if (res.data) {
            setSmtpConfig({
              server: res.data.server || 'smtp.gmail.com',
              port: res.data.port || 587,
              senderEmail: res.data.senderEmail || '',
              senderName: res.data.senderName || 'Nómina Enfoco Institucional',
              password: res.data.password || '',
              enableSsl: res.data.enableSsl ?? true,
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:5289/api/config/smtp', smtpConfig);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert('Error al guardar la configuración SMTP en la base de datos.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Configuración de Servidor SMTP</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Servidor SMTP</label>
            <input
              type="text"
              value={smtpConfig.server}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, server: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Puerto</label>
            <input
              type="number"
              value={smtpConfig.port}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) || 587 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Correo Remitente / Usuario</label>
            <input
              type="email"
              placeholder="tu-correo@empresa.com"
              value={smtpConfig.senderEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, senderEmail: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Contraseña de Aplicación</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={smtpConfig.password}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};