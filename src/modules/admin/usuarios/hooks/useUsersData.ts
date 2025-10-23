import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type PersonTypeFilterState,
  type RoleFilterState,
  type UserRecord,
  type UsersFilters,
  type UsersStats
} from '../types';
import { createUserDataService } from '../services/userDataService';

interface UseUsersDataResult {
  users: UserRecord[];
  filteredUsers: UserRecord[];
  stats: UsersStats;
  filters: UsersFilters;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  setSearch: (value: string) => void;
  toggleRoleFilter: (role: keyof RoleFilterState) => void;
  togglePersonTypeFilter: (tipo: keyof PersonTypeFilterState) => void;
  resetFilters: () => void;
}

const DEFAULT_ROLE_FILTER: RoleFilterState = {
  todos: true,
  ADMINISTRADOR: false,
  DONANTE: false,
  SOLICITANTE: false
};

const DEFAULT_PERSON_FILTER: PersonTypeFilterState = {
  todos: true,
  Natural: false,
  Juridica: false
};

const DEFAULT_FILTERS: UsersFilters = {
  search: '',
  roles: { ...DEFAULT_ROLE_FILTER },
  personTypes: { ...DEFAULT_PERSON_FILTER }
};

const computeStats = (users: UserRecord[]): UsersStats => {
  return users.reduce<UsersStats>((acc, user) => {
    acc.total += 1;

    if (user.rol === 'ADMINISTRADOR') acc.administradores += 1;
    if (user.rol === 'DONANTE') acc.donantes += 1;
    if (user.rol === 'SOLICITANTE') acc.solicitantes += 1;

    if (user.estado === 'bloqueado') acc.bloqueados += 1;
    if (!user.estado || user.estado === 'activo') acc.activos += 1;

    return acc;
  }, {
    total: 0,
    administradores: 0,
    donantes: 0,
    solicitantes: 0,
    activos: 0,
    bloqueados: 0
  });
};

const applyFilters = (users: UserRecord[], filters: UsersFilters): UserRecord[] => {
  const term = filters.search.trim().toLowerCase();

  return users.filter(user => {
    const matchesSearch = term
      ? [
          user.nombre,
          user.cedula,
          user.ruc,
          user.telefono,
          user.email,
          user.representante
        ].some(field => field?.toLowerCase().includes(term))
      : true;

    const matchesRole = filters.roles.todos
      ? true
      : filters.roles[user.rol];

    const matchesPersonType = filters.personTypes.todos
      ? true
      : (user.tipo_persona === 'Natural' && filters.personTypes.Natural) ||
        (user.tipo_persona === 'Juridica' && filters.personTypes.Juridica);

    return matchesSearch && matchesRole && matchesPersonType;
  });
};

export const useUsersData = (supabaseClient: SupabaseClient): UseUsersDataResult => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filters, setFilters] = useState<UsersFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const service = useMemo(() => createUserDataService(supabaseClient), [supabaseClient]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    const result = await service.fetchUsers();

    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      setError(result.error ?? 'No fue posible cargar los usuarios');
    }

    setLoading(false);
  }, [service]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const stats = useMemo(() => computeStats(users), [users]);
  const filteredUsers = useMemo(() => applyFilters(users, filters), [users, filters]);

  const setSearch = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  }, []);

  const toggleRoleFilter = useCallback((role: keyof RoleFilterState) => {
    setFilters(prev => {
      if (role === 'todos') {
        return {
          ...prev,
          roles: { ...DEFAULT_ROLE_FILTER }
        };
      }

      const updated = {
        ...prev.roles,
        todos: false,
        [role]: !prev.roles[role]
      } as RoleFilterState;

      const anySelected = ['ADMINISTRADOR', 'DONANTE', 'SOLICITANTE']
        .some(key => updated[key as keyof RoleFilterState]);

      return {
        ...prev,
        roles: anySelected ? updated : { ...DEFAULT_ROLE_FILTER }
      };
    });
  }, []);

  const togglePersonTypeFilter = useCallback((tipo: keyof PersonTypeFilterState) => {
    setFilters(prev => {
      if (tipo === 'todos') {
        return {
          ...prev,
          personTypes: { ...DEFAULT_PERSON_FILTER }
        };
      }

      const updated = {
        ...prev.personTypes,
        todos: false,
        [tipo]: !prev.personTypes[tipo]
      } as PersonTypeFilterState;

      const anySelected = ['Natural', 'Juridica']
        .some(key => updated[key as keyof PersonTypeFilterState]);

      return {
        ...prev,
        personTypes: anySelected ? updated : { ...DEFAULT_PERSON_FILTER }
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const refresh = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  return {
    users,
    filteredUsers,
    stats,
    filters,
    loading,
    error,
    refresh,
    setSearch,
    toggleRoleFilter,
    togglePersonTypeFilter,
    resetFilters
  };
};
