export interface DashboardCounts {
  totalUsuarios: number;
  totalSolicitudes: number;
  tasaAprobacion: number;
  pendientes: number;
}

export interface RoleDistributionItem {
  role: 'ADMINISTRADOR' | 'DONANTE' | 'SOLICITANTE';
  count: number;
  percentage: number;
}

export interface RequestStatusItem {
  label: string;
  count: number;
  percentage: number;
  accent: 'yellow' | 'green' | 'red' | 'blue';
}

export interface UserTypeItem {
  label: string;
  count: number;
  percentage: number;
  accent: 'blue' | 'purple' | 'slate';
}

export interface DashboardData {
  counts: DashboardCounts;
  roleDistribution: RoleDistributionItem[];
  requestStatus: RequestStatusItem[];
  userTypes: UserTypeItem[];
}
