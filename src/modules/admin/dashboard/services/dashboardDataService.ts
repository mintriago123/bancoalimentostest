import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DashboardData,
  DashboardCounts,
  RoleDistributionItem,
  RequestStatusItem,
  UserTypeItem
} from '../types';

interface UsuariosRow {
  rol: 'ADMINISTRADOR' | 'DONANTE' | 'SOLICITANTE';
  tipo_persona: string | null;
}

interface SolicitudesRow {
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'entregada';
}

const MAX_ROWS = 1000;

export const createDashboardDataService = (supabaseClient: SupabaseClient) => {
  const fetchDashboardData = async (): Promise<DashboardData> => {
    const [usuariosResult, solicitudesResult] = await Promise.all([
      supabaseClient
        .from('usuarios')
        .select('rol, tipo_persona', { count: 'exact' })
        .range(0, MAX_ROWS - 1)
        .throwOnError(),
      supabaseClient
        .from('solicitudes')
        .select('estado', { count: 'exact' })
        .range(0, MAX_ROWS - 1)
        .throwOnError()
    ]);

    const usuarios = (usuariosResult.data ?? []) as UsuariosRow[];
    const solicitudes = (solicitudesResult.data ?? []) as SolicitudesRow[];

    const totalUsuarios = usuariosResult.count ?? usuarios.length;
    const totalSolicitudes = solicitudesResult.count ?? solicitudes.length;

    const roleCounts = usuarios.reduce(
      (acc, usuario) => {
        acc[usuario.rol] = (acc[usuario.rol] ?? 0) + 1;
        return acc;
      },
      { ADMINISTRADOR: 0, DONANTE: 0, SOLICITANTE: 0 } as Record<UsuariosRow['rol'], number>
    );

    const userTypeCounts = usuarios.reduce(
      (acc, usuario) => {
        const tipo = usuario.tipo_persona?.toUpperCase();
        if (tipo === 'NATURAL' || tipo === 'JURIDICA') {
          acc[tipo] = (acc[tipo] ?? 0) + 1;
        } else {
          acc.UNKNOWN += 1;
        }
        return acc;
      },
      { NATURAL: 0, JURIDICA: 0, UNKNOWN: 0 } as Record<'NATURAL' | 'JURIDICA' | 'UNKNOWN', number>
    );

    const requestCounts = solicitudes.reduce(
      (acc, solicitud) => {
        acc[solicitud.estado] = (acc[solicitud.estado] ?? 0) + 1;
        return acc;
      },
      { pendiente: 0, aprobada: 0, rechazada: 0, entregada: 0 } as Record<SolicitudesRow['estado'], number>
    );

    const tasaAprobacionBase = requestCounts.aprobada + requestCounts.rechazada;

    const counts: DashboardCounts = {
      totalUsuarios,
      totalSolicitudes,
      tasaAprobacion: tasaAprobacionBase > 0
        ? Math.round((requestCounts.aprobada / tasaAprobacionBase) * 100)
        : 0,
      pendientes: requestCounts.pendiente
    };

    const roleDistribution: RoleDistributionItem[] = (
      Object.entries(roleCounts) as Array<[UsuariosRow['rol'], number]>
    ).map(([role, count]) => ({
      role,
      count,
      percentage: totalUsuarios > 0 ? Math.round((count / totalUsuarios) * 100) : 0
    }));

    const requestStatus: RequestStatusItem[] = [
      {
        label: 'Pendientes',
        count: requestCounts.pendiente,
        percentage: totalSolicitudes > 0 ? Math.round((requestCounts.pendiente / totalSolicitudes) * 100) : 0,
        accent: 'yellow'
      },
      {
        label: 'Aprobadas',
        count: requestCounts.aprobada,
        percentage: totalSolicitudes > 0 ? Math.round((requestCounts.aprobada / totalSolicitudes) * 100) : 0,
        accent: 'green'
      },
      {
        label: 'Rechazadas',
        count: requestCounts.rechazada,
        percentage: totalSolicitudes > 0 ? Math.round((requestCounts.rechazada / totalSolicitudes) * 100) : 0,
        accent: 'red'
      },
      {
        label: 'Entregadas',
        count: requestCounts.entregada,
        percentage: totalSolicitudes > 0 ? Math.round((requestCounts.entregada / totalSolicitudes) * 100) : 0,
        accent: 'blue'
      }
    ];

    const userTypes: UserTypeItem[] = [
      {
        label: 'Personas Naturales',
        count: userTypeCounts.NATURAL,
        percentage: totalUsuarios > 0 ? Math.round((userTypeCounts.NATURAL / totalUsuarios) * 100) : 0,
        accent: 'blue'
      },
      {
        label: 'Personas Jurídicas',
        count: userTypeCounts.JURIDICA,
        percentage: totalUsuarios > 0 ? Math.round((userTypeCounts.JURIDICA / totalUsuarios) * 100) : 0,
        accent: 'purple'
      }
    ];

    return {
      counts,
      roleDistribution,
      requestStatus,
      userTypes
    };
  };

  return {
    fetchDashboardData
  };
};
