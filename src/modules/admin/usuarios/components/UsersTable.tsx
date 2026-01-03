import { Mail, Phone, Building, User } from 'lucide-react';
import type { UserRecord, UserRole, UserStatus } from '../types';

interface UsersTableProps {
  users: UserRecord[];
  processingId?: string;
  onChangeRole: (userId: string, newRole: UserRole) => void;
  onChangeStatus: (user: UserRecord, newStatus: UserStatus) => void;
}

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'DONANTE', label: 'Donante' },
  { value: 'SOLICITANTE', label: 'Solicitante' }
];

const STATUS_BADGE: Record<string, string> = {
  activo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  bloqueado: 'bg-rose-100 text-rose-700 border-rose-200',
  desactivado: 'bg-slate-100 text-slate-500 border-slate-200'
};

const UsersTable = ({ users, processingId, onChangeRole, onChangeStatus }: UsersTableProps) => {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-12 text-center shadow-sm">
        <div className="text-slate-400">No se encontraron usuarios con los filtros aplicados.</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="overflow-x-auto">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Usuario</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden md:table-cell">Contacto</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hidden lg:table-cell">Tipo</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {users.map(user => {
                const isProcessing = processingId === user.id;
                const badgeClass = STATUS_BADGE[user.estado ?? 'activo'] ?? STATUS_BADGE.activo;

                return (
                  <tr key={user.id} className="transition-colors duration-150 hover:bg-slate-50">
                    <td className="px-3 sm:px-4 lg:px-6 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{user.nombre}</div>
                      <div className="text-xs text-slate-500">
                        {user.tipo_persona === 'Juridica'
                          ? user.ruc || 'Sin RUC'
                          : user.cedula || 'Sin cédula'}
                      </div>
                      {/* Mostrar info de contacto en móviles */}
                      <div className="md:hidden mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{user.telefono || 'Sin teléfono'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{user.email || 'Sin correo'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{user.telefono || 'Sin teléfono'}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{user.email || 'Sin correo'}</span>
                      </div>
                      {user.tipo_persona === 'Juridica' && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                          <Building className="h-4 w-4 text-slate-400" />
                          <span>{user.representante || 'Sin representante'}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4">
                      <select
                        value={user.rol}
                        disabled={isProcessing}
                        onChange={(event) => onChangeRole(user.id, event.target.value as UserRole)}
                        className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-100 w-full sm:w-auto"
                      >
                        {ROLE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {/* Mostrar tipo de persona en móviles */}
                      <div className="lg:hidden mt-2">
                        <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                          {user.tipo_persona === 'Juridica' ? <Building className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {user.tipo_persona || 'Sin tipo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                        {user.tipo_persona === 'Juridica' ? <Building className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                        {user.tipo_persona || 'Sin tipo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2 sm:px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                        {user.estado ?? 'activo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isProcessing || user.estado === 'activo'}
                          onClick={() => onChangeStatus(user, 'activo')}
                          className="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-2 sm:px-3 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                        >
                          Activar
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing || user.estado === 'bloqueado'}
                          onClick={() => onChangeStatus(user, 'bloqueado')}
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-2 sm:px-3 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                        >
                          Bloquear
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing || user.estado === 'desactivado'}
                          onClick={() => onChangeStatus(user, 'desactivado')}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 sm:px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
                        >
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
