import { Shield, Users, UserCheck, UserX } from 'lucide-react';
import StatCard from '@/modules/admin/shared/components/StatCard';
import type { UsersStats } from '../types';

interface UsersHeaderProps {
  stats: UsersStats;
}

const UsersHeader = ({ stats }: UsersHeaderProps) => (
  <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,3fr)] lg:items-start">
    <div className="rounded-2xl border border-slate-200 bg-slate-900/5 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/10 text-slate-700">
          <Shield className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Gestión de usuarios</p>
          <p className="text-sm text-slate-500">
            Administra roles, estados y contactos de la comunidad del banco de alimentos.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Usuarios registrados"
        value={stats.total}
        accent="blue"
        icon={<Users className="h-5 w-5" />}
        sublabel="Activos en la plataforma"
      />
      <StatCard
        label="Administradores"
        value={stats.administradores}
        accent="purple"
        icon={<Shield className="h-5 w-5" />}
        sublabel="Gestión y control"
      />
      <StatCard
        label="Activos"
        value={stats.activos}
        accent="green"
        icon={<UserCheck className="h-5 w-5" />}
        sublabel="Con acceso habilitado"
      />
      <StatCard
        label="Bloqueados"
        value={stats.bloqueados}
        accent="red"
        icon={<UserX className="h-5 w-5" />}
        sublabel="Revisar incidencias"
      />
    </div>
  </div>
);

export default UsersHeader;
