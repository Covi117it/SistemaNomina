import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { authApi } from '../service/api/authApi';
import { Usuario, CrearUsuarioRequest, ActualizarUsuarioRequest } from '../types/usuario';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SearchInput } from '../components/common/SearchInput';
import { PillFilterGroup } from '../components/common/PillFilterGroup';
import { Pagination } from '../components/common/Pagination';
import { UsersTable } from '../components/user/UsersTable';
import { UserFormModal } from '../components/user/UserFormModal';
import { ActionsDropdown } from '../components/common/ActionsDropdown';

interface UsersManagementPageProps {
  onBack: () => void;
  onNavigateToCreateUser?: () => void;
  onNavigateToEditUser?: (user: Usuario) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
  onInspectUser?: (user: Usuario) => void;
}

export const UsersManagementPage: React.FC<UsersManagementPageProps> = ({ 
  onBack, 
  onNavigateToCreateUser,
  onNavigateToEditUser,
  onInspectUser,
  onNavigateToDashboard,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO' | 'ADMIN'>('TODOS');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authApi.fetchUsuarios();
      setUsers(data);
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const message = status === 403
        ? 'Tu cuenta no tiene permiso para gestionar usuarios. Contacta a un administrador para revisar tu rol.'
        : status === 401
          ? 'Tu sesión ya no es válida. Cierra sesión e inicia sesión nuevamente.'
          : 'No se pudieron cargar los usuarios del sistema. Comprueba la conexión e inténtalo de nuevo.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.activo).length;
    const inactivos = users.filter((u) => !u.activo).length;
    const admins = users.filter((u) => u.rol.toUpperCase() === 'ADMIN').length;

    return { total, activos, inactivos, admins };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (filterRole === 'ACTIVO') matchesFilter = user.activo;
      if (filterRole === 'INACTIVO') matchesFilter = !user.activo;
      if (filterRole === 'ADMIN') matchesFilter = user.rol.toUpperCase() === 'ADMIN';

      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterRole]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (
    data: CrearUsuarioRequest | ActualizarUsuarioRequest,
    isEdit: boolean,
    id?: number
  ) => {
    if (isEdit && id) {
      await authApi.updateUsuario(id, data as ActualizarUsuarioRequest);
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'Los cambios fueron guardados exitosamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      await authApi.createUsuario(data as CrearUsuarioRequest);
      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El nuevo colaborador ha sido registrado.',
        timer: 2000,
        showConfirmButton: false,
      });
    }
    await loadUsers();
  };

  const handleDeleteUser = async (user: Usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `¿Estás seguro de que deseas eliminar la cuenta de <b>${user.nombreCompleto}</b>? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await authApi.deleteUsuario(user.id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El usuario ha sido eliminado del sistema.',
          timer: 2000,
          showConfirmButton: false,
        });
        await loadUsers();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Error al eliminar el usuario.';
        Swal.fire({
          icon: 'error',
          title: 'No se pudo eliminar',
          text: msg,
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Gestión de Usuarios y Accesos"
        icon={<ShieldCheck className="w-7 h-7 text-indigo-600" />}
        onBack={onBack}
        leftActions={
          onNavigateToDashboard && (
            <ActionsDropdown
              onNavigateToDashboard={onNavigateToDashboard}
              onNavigateToDirectory={onNavigateToDirectory}
              onNavigateToCreate={onNavigateToCreate}
              onNavigateToPayroll={onNavigateToPayroll}
              onNavigateToHistory={onNavigateToHistory}
              onNavigateToDistribution={onNavigateToDistribution}
            />
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Actualizar listado"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={() => {
              if (onNavigateToCreateUser) {
                onNavigateToCreateUser();
             } else {
                    handleOpenCreate();
    }
  }}
  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
>
            <UserPlus className="w-4 h-4" />
                Nuevo Usuario
             </button>
          </div>
        }
      />

      {/* 2. Tarjetas de Estadísticas (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Usuarios"
          value={stats.total}
          icon={<Users className="w-5 h-5" />}
          variant="slate"
        />
        <StatCard
          label="Cuentas Activas"
          value={stats.activos}
          icon={<UserCheck className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          label="Cuentas Inactivas"
          value={stats.inactivos}
          icon={<UserX className="w-5 h-5" />}
          variant="rose"
        />
        <StatCard
          label="Administradores"
          value={stats.admins}
          icon={<ShieldAlert className="w-5 h-5" />}
          variant="indigo"
        />
      </div>


      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <SearchInput
            placeholder="Buscar por nombre o correo electrónico..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
          />
        </div>

        <PillFilterGroup
          options={[
            { key: 'TODOS', label: 'Todos', count: stats.total },
            { key: 'ACTIVO', label: 'Activos', count: stats.activos },
            { key: 'INACTIVO', label: 'Inactivos', count: stats.inactivos },
            { key: 'ADMIN', label: 'Admins', count: stats.admins },
          ]}
          value={filterRole}
          onChange={(val) => {
            setFilterRole(val as any);
            setCurrentPage(1);
          }}
        />
      </div>


      <UsersTable
        users={paginatedUsers}
        loading={loading}
        onEdit={(user) => {
          if (onNavigateToEditUser) {
            onNavigateToEditUser(user);
          } else {
            handleOpenEdit(user);
          }
        }}
        onDelete={handleDeleteUser}
        onInspect={(user) => onInspectUser?.(user)}
      />


      {!loading && filteredUsers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={() => {}}
          totalItems={filteredUsers.length}
          itemLabel="usuarios"
        />
      )}

   
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
      />
    </div>
  );
};