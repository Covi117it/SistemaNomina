import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  X,
  Download,
  FileText,
  Loader2,
  Printer,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NominaItem } from '../../types/nomina';
import { ENDPOINTS } from '../../config/api';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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
  conceptoPeriodo = '',
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      fetchPdf();
    } else {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      setPdfDoc(null);
    }
  }, [isOpen, item]);

  const fetchPdf = async () => {
    if (!item) return;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${ENDPOINTS.NOMINA}/generar-volante-pdf?conceptoPeriodo=${encodeURIComponent(conceptoPeriodo)}`,
        item,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);

      const arrayBuffer = await blob.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setPageNum(1);
    } catch (err) {
      setError('No se pudo generar la vista previa del comprobante PDF.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let renderTask: any = null;

    pdfDoc.getPage(pageNum).then((page) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      renderTask = page.render(renderContext);
    });

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum, scale]);

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
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
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

        {/* Barra de Controles de Vista Previa */}
        {pdfDoc && (
          <div className="flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <button
                disabled={pageNum <= 1}
                onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Página {pageNum} de {numPages}
              </span>
              <button
                disabled={pageNum >= numPages}
                onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
                className="p-1 rounded hover:bg-slate-200 cursor-pointer"
                title="Alejar"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span>{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                className="p-1 rounded hover:bg-slate-200 cursor-pointer"
                title="Acercar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Contenedor del Canvas PDF */}
        <div className="flex-1 p-4 bg-slate-200/70 overflow-auto flex items-center justify-center min-h-[500px] max-h-[70vh]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">
                Generando vista previa del volante...
              </p>
            </div>
          ) : error ? (
            <div className="text-center text-rose-600 font-semibold p-4 bg-white rounded-xl shadow-sm">
              {error}
            </div>
          ) : (
            <canvas ref={canvasRef} className="shadow-lg rounded-lg bg-white" />
          )}
        </div>
      </div>
    </div>
  );
};