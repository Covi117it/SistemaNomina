import React from 'react';
import { 
  Users, 
  UserPlus, 
  Calculator, 
  History, 
  Mail, 
  Building2, 
  ArrowRight,
  Folder
} from 'lucide-react';

interface ModuleNavigationGridProps {
  totalTotal: number;
  onNavigateToDirectory: () => void;
  onNavigateToCreate: () => void;
  onNavigateToPayroll: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDistribution: () => void;
}

export const ModuleNavigationGrid: React.FC<ModuleNavigationGridProps> = ({
  totalTotal,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const modules = [
    {
      title: 'Directorio de Empleados',
      category: 'MAESTRO DE PERSONAL',
      description: `Consulta el maestro con ${totalTotal} trabajadores registrados, edición de datos y filtros.`,
      icon: Users,
      actionLabel: 'Abrir Directorio',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      onClick: onNavigateToDirectory,
    },
    {
      title: 'Registrar Nuevo Empleado',
      category: 'ALTA DE PERSONAL',
      description: 'Dar de alta un nuevo trabajador en el sistema con código asignado automáticamente.',
      icon: UserPlus,
      actionLabel: 'Registrar Empleado',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      onClick: onNavigateToCreate,
    },
    {
      title: 'Procesamiento de Nómina',
      category: 'CÁLCULO Y PAGOS',
      description: 'Carga archivos Excel quincenales, previsualiza cálculos y confirma la ejecución.',
      icon: Calculator,
      actionLabel: 'Cargar Nómina',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      onClick: onNavigateToPayroll,
    },
    {
      title: 'Histórico de Nóminas',
      category: 'REGISTROS ANTERIORES',
      description: 'Accede al registro histórico de quincenas procesadas y consulta comprobantes.',
      icon: History,
      actionLabel: 'Ver Histórico',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      onClick: onNavigateToHistory,
    },
    {
      title: 'Distribución de Volantes',
      category: 'ENVÍO MASIVO',
      description: 'Generación y despacho masivo de comprobantes PDF directo al correo de cada empleado.',
      icon: Mail,
      actionLabel: 'Despachar Volantes',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      onClick: onNavigateToDistribution,
    },
    {
      title: 'Procesar Nómina de la Quincena',
      category: 'CÁLCULO Y PAGOS',
      description: 'Carga el archivo Excel quincenal para previsualizar recálculos y generar recibos PDF.',
      icon: Building2,
      actionLabel: 'Procesar Nómina Ahora',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      onClick: onNavigateToPayroll,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Módulos del Sistema
          </h2>
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Acceso Principal
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <div 
              key={idx}
              onClick={mod.onClick}
              className="group bg-white hover:bg-slate-50/50 border border-slate-200/80 hover:border-emerald-300 rounded-[28px] p-6 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 border rounded-2xl group-hover:scale-105 transition-transform ${mod.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {mod.category}
                </p>
                <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  {mod.description}
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                <span>{mod.actionLabel}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
