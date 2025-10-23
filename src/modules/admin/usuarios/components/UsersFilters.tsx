import { Search, Users, UserSquare2 } from 'lucide-react';
import type { PersonTypeFilterState, RoleFilterState } from '../types';

interface UsersFiltersProps {
  search: string;
  roles: RoleFilterState;
  personTypes: PersonTypeFilterState;
  onSearchChange: (value: string) => void;
  onToggleRole: (role: keyof RoleFilterState) => void;
  onTogglePersonType: (tipo: keyof PersonTypeFilterState) => void;
  onResetFilters: () => void;
}

const UsersFilters = ({
  search,
  roles,
  personTypes,
  onSearchChange,
  onToggleRole,
  onTogglePersonType,
  onResetFilters
}: UsersFiltersProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, documento, correo o contacto"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <Users className="h-4 w-4 text-slate-400" /> Rol:
        </span>
        {Object.entries(roles).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onToggleRole(key as keyof RoleFilterState)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key === 'todos' ? 'Todos' : key}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
          <UserSquare2 className="h-4 w-4 text-slate-400" /> Tipo:
        </span>
        {Object.entries(personTypes).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => onTogglePersonType(key as keyof PersonTypeFilterState)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              value ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {key === 'todos' ? 'Todos' : key}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        Limpiar filtros
      </button>
    </div>
  </div>
);

export default UsersFilters;
