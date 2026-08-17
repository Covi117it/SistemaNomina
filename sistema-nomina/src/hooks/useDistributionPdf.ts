import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { NominaItem } from '../types/nomina';
import { ExtendedNominaItem } from '../components/payroll/DistributionTable';
import { ENDPOINTS } from '../config/api';
import { payrollApi } from '../service/api/payrollApi';

export const useDistributionPdf = (items: NominaItem[] = [], conceptoPeriodo: string = '') => {
  const [sending, setSending] = useState(false);
  const [loadingHistoric, setLoadingHistoric] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ exitosos: number; fallidos: number } | null>(null);
  const [localItems, setLocalItems] = useState<ExtendedNominaItem[]>(items || []);
  const [periodoNombre, setPeriodoNombre] = useState<string>(conceptoPeriodo);
  const [searchTerm, setSearchTerm] = useState('');
  const [distributionFilter, setDistributionFilter] = useState<'TODOS' | 'INCLUIDOS' | 'EXCLUIDOS'>('TODOS');
  const [periodosHistoricos, setPeriodosHistoricos] = useState<any[]>([]);
  const [selectedPeriodoId, setSelectedPeriodoId] = useState<number | null>(null);

  useEffect(() => {
    if (!conceptoPeriodo) {
      payrollApi.fetchPeriodoSugerido().then((res) => {
        if (res?.concepto) setPeriodoNombre(res.concepto);
      }).catch(() => {});
    }
  }, [conceptoPeriodo]);

  const cargarDetallesPeriodo = (periodo: any) => {
    setPeriodoNombre(periodo.concepto || conceptoPeriodo);
    if (periodo.detalles) {
      const mappedItems = periodo.detalles
        .map((det: any) => ({
          codigoEmpleado: det.codigoEmpleado,
          nombreEmpleado: det.nombreEmpleadoSnapshot,
          sueldoBase: det.sueldoPeriodo,
          quincena: periodo.quincena,
          totalDevengado: det.totalDevengado,
          totalDeducciones: det.totalDeducciones,
          netoAPagar: det.netoPagado,
          emailDestinatario: det.emailDestinatario,
          empleadoExiste: true,
          excluido: false,
        }))
        .sort((a: any, b: any) =>
          (a.codigoEmpleado || '').localeCompare(b.codigoEmpleado || '', undefined, { numeric: true, sensitivity: 'base' })
        );
      setLocalItems(mappedItems);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (items && items.length > 0) {
      setLocalItems(items.map((i) => ({ ...i, excluido: false })));
      setLoadingHistoric(false);
    } else {
      setLoadingHistoric(true);
      axios.get(`${ENDPOINTS.NOMINA}/historico`)
        .then((res) => {
          if (!isMounted) return;
          if (res.data && res.data.length > 0) {
            setPeriodosHistoricos(res.data);
            const pInicial = res.data[0];
            setSelectedPeriodoId(pInicial.id);
            cargarDetallesPeriodo(pInicial);
          } else {
            setLocalItems([]);
          }
        })
        .catch((err) => {
          console.error('Error cargando volantes históricos:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingHistoric(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [items?.length]);

  const handleUpdateEmail = (codigoEmpleado: string, newEmail: string) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.codigoEmpleado === codigoEmpleado ? { ...item, emailDestinatario: newEmail } : item
      )
    );
  };

  const handleToggleExclude = (codigoEmpleado: string, exclude: boolean) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.codigoEmpleado === codigoEmpleado ? { ...item, excluido: exclude } : item
      )
    );
  };

  const safeItems = localItems || [];
  const activeItems = safeItems.filter((i) => !i.excluido);
  const excludedItemsCount = safeItems.length - activeItems.length;

  const filteredItems = safeItems.filter((i) => {
    if (distributionFilter === 'INCLUIDOS' && i.excluido) return false;
    if (distributionFilter === 'EXCLUIDOS' && !i.excluido) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const codigo = (i.codigoEmpleado || '').toLowerCase();
    const nombre = (i.nombreEmpleado || '').toLowerCase();
    const puesto = (i.puestoEmpleado || '').toLowerCase();
    const email = (i.emailDestinatario || '').toLowerCase();

    return (
      codigo.includes(term) ||
      nombre.includes(term) ||
      puesto.includes(term) ||
      email.includes(term)
    );
  });

  const validEmailsCount = activeItems.filter((i) => i.emailDestinatario && i.emailDestinatario.includes('@')).length;
  const totalMonto = activeItems.reduce((acc, i) => acc + (i.netoAPagar || 0), 0);

  const handleSendEmails = async () => {
    if (activeItems.length === 0) return;

    const noRegistrados = activeItems.filter(
      (i) => !i.empleadoExiste || i.eStatusEmpleado === 'NO_EXISTE' || i.nombreEmpleado?.includes('NO REGISTRADO')
    );

    if (noRegistrados.length > 0) {
      const codigosLista = noRegistrados.map((i) => i.codigoEmpleado).join(', ');
      Swal.fire({
        title: '¡No se puede realizar el envío masivo!',
        html: `
          <div class="text-left text-xs text-slate-600 space-y-3 pt-2">
            <p class="font-bold text-slate-800 text-sm">
              Existen <span class="text-rose-600 font-extrabold">${noRegistrados.length} empleados</span> en la lista de envío que no están registrados en la Base de Datos:
            </p>
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-rose-800 font-bold text-xs tracking-wide">
              Códigos: ${codigosLista}
            </div>
            <p class="text-slate-500 font-medium leading-relaxed">
              Debe registrar a estos empleados en el catálogo antes de poder despachar los volantes de pago por correo.
            </p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200 font-sans p-6',
          title: 'text-lg font-extrabold text-slate-900',
        },
      });
      return;
    }

    setSending(true);
    setDispatchResult(null);

    try {
      const smtpRes = await axios.get(`${ENDPOINTS.CONFIG}/smtp`);
      const payload = {
        items: activeItems,
        conceptoPeriodo: periodoNombre,
        smtpConfig: smtpRes.data,
      };

      const res = await axios.post(`${ENDPOINTS.NOMINA}/enviar-volantes-correo`, payload);
      setDispatchResult({
        exitosos: res.data.exitosos || activeItems.length,
        fallidos: res.data.fallidos || 0,
      });
    } catch (err: any) {
      const msg = err.response?.data?.mensaje || 'Error al conectar con el servidor SMTP de correo.';
      alert(msg);
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    loadingHistoric,
    showSmtpModal,
    setShowSmtpModal,
    dispatchResult,
    periodoNombre,
    searchTerm,
    setSearchTerm,
    distributionFilter,
    setDistributionFilter,
    periodosHistoricos,
    selectedPeriodoId,
    setSelectedPeriodoId,
    cargarDetallesPeriodo,
    safeItems,
    activeItems,
    excludedItemsCount,
    filteredItems,
    validEmailsCount,
    totalMonto,
    handleUpdateEmail,
    handleToggleExclude,
    handleSendEmails,
  };
};
