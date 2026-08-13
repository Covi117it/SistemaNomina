import { Users, UserPlus, UploadCloud, History, FileText, LayoutDashboard } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  hoverBg: string;
  hoverText: string;
  hoverIconBg: string;
  hoverIconColor: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const NAVIGATION_SECTIONS = [
  {
    title: 'General',
    items: [
      {
        id: 'dashboard',
        label: 'Menú Principal',
        icon: LayoutDashboard,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        hoverBg: 'hover:bg-emerald-50/80',
        hoverText: 'hover:text-emerald-800',
        hoverIconBg: 'group-hover:bg-emerald-500',
        hoverIconColor: 'group-hover:text-white',
      },
    ],
  },
  {
    title: 'Empleados y Personal',
    items: [
      {
        id: 'directory',
        label: 'Directorio de Empleados',
        icon: Users,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        hoverBg: 'hover:bg-emerald-50/80',
        hoverText: 'hover:text-emerald-800',
        hoverIconBg: 'group-hover:bg-emerald-500',
        hoverIconColor: 'group-hover:text-white',
      },
      {
        id: 'create',
        label: 'Registrar Nuevo Empleado',
        icon: UserPlus,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        hoverBg: 'hover:bg-emerald-50/80',
        hoverText: 'hover:text-emerald-800',
        hoverIconBg: 'group-hover:bg-emerald-500',
        hoverIconColor: 'group-hover:text-white',
      },
    ],
  },
  {
    title: 'Procesamiento de Pagos',
    items: [
      {
        id: 'payroll',
        label: 'Carga y Procesamiento',
        icon: UploadCloud,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        hoverBg: 'hover:bg-emerald-50/80',
        hoverText: 'hover:text-emerald-800',
        hoverIconBg: 'group-hover:bg-emerald-500',
        hoverIconColor: 'group-hover:text-white',
      },
      {
        id: 'history',
        label: 'Histórico de Nóminas',
        icon: History,
        iconBg: 'bg-indigo-50',
        iconColor: 'text-indigo-600',
        hoverBg: 'hover:bg-indigo-50/80',
        hoverText: 'hover:text-indigo-800',
        hoverIconBg: 'group-hover:bg-indigo-600',
        hoverIconColor: 'group-hover:text-white',
      },
    ],
  },
  {
    title: 'Volantes y Correos',
    items: [
      {
        id: 'distribution',
        label: 'Distribución de PDF',
        icon: FileText,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        hoverBg: 'hover:bg-amber-50/80',
        hoverText: 'hover:text-amber-800',
        hoverIconBg: 'group-hover:bg-amber-500',
        hoverIconColor: 'group-hover:text-white',
      },
    ],
  },
];
