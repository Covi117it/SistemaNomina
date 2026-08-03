import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Download, FileText, Loader2, Printer } from 'lucide-react';
import { NominaItem } from '../../types/nomina';

interface PDFPaystubModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: NominaItem | null;
  conceptoPeriodo?: string;
}

export const PDFPaystubModal: React.FC<PDFPaystubModalProps> = ({
  isOpen,
  onClose,
  item,
  conceptoPeriodo = 'Primera Quincena de Enero 2026',
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      fetchPdf();
    } else {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    }
  }, [isOpen, item]);

  const fetchPdf = async () => {
    if (!item) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:5289/api/nomina/generar-volante-pdf?conceptoPeriodo=${encodeURIComponent(conceptoPeriodo)}`,
        item,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      setError('No se pudo generar la vista previa del comprobante PDF.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl || !item) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Volante_Pago_${item.codigoEmpleado}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const iframe = document.getElementById('pdf-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Comprobante de Pago en PDF
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {item.codigoEmpleado} - {item.nombreEmpleado || 'Empleado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfUrl && (
              <>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal: Visor PDF */}
        <div className="flex-1 p-6 bg-slate-100 flex items-center justify-center min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">Generando vista previa del volante...</p>
            </div>
          ) : error ? (
            <div className="text-center text-rose-600 font-semibold p-4">
              {error}
            </div>
          ) : pdfUrl ? (
            <iframe
              id="pdf-preview-iframe"
              src={pdfUrl}
              className="w-full h-[550px] rounded-xl border border-slate-200 shadow-md bg-white"
              title="Vista Previa Volante PDF"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};