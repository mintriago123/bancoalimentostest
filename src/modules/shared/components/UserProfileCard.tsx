"use client";

import { lazy, Suspense } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Calendar,
  Shield,
  Loader2,
} from 'lucide-react';

// Lazy load del mapa estático
const MapboxStaticMap = lazy(() => import('./MapboxStaticMap'));

// Configuración de colores por rol
const roleConfig = {
  SOLICITANTE: {
    primary: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    button: 'bg-blue-600 hover:bg-blue-700',
    ring: 'focus:ring-blue-500',
    label: 'Solicitante',
  },
  DONANTE: {
    primary: 'green',
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
    button: 'bg-green-600 hover:bg-green-700',
    ring: 'focus:ring-green-500',
    label: 'Donante',
  },
  OPERADOR: {
    primary: 'red',
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
    button: 'bg-red-600 hover:bg-red-700',
    ring: 'focus:ring-red-500',
    label: 'Operador',
  },
  ADMINISTRADOR: {
    primary: 'red',
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
    button: 'bg-red-600 hover:bg-red-700',
    ring: 'focus:ring-red-500',
    label: 'Administrador',
  },
};

interface UserProfile {
  id: string;
  email?: string;
  nombre: string;
  cedula?: string;
  ruc?: string;
  telefono: string;
  direccion: string;
  rol: string;
  tipo_persona: string;
  representante?: string;
  created_at?: string;
  updated_at?: string;
  latitud?: number | null;
  longitud?: number | null;
}

interface UserProfileCardProps {
  profile: UserProfile;
  onEdit?: () => void;
  showMap?: boolean;
  isEditable?: boolean;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'No disponible';
  return new Date(dateString).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function UserProfileCard({
  profile,
  onEdit,
  showMap = true,
  isEditable = false,
}: UserProfileCardProps) {
  const rol = profile.rol as keyof typeof roleConfig;
  const colors = roleConfig[rol] || roleConfig.SOLICITANTE;
  const isJuridica = profile.tipo_persona === 'Juridica';

  return (
    <div className="space-y-6">
      {/* Header con Avatar y Info Principal */}
      <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner">
              {getInitials(profile.nombre)}
            </div>
          </div>

          {/* Info Principal */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{profile.nombre}</h2>
            <div className="flex items-center gap-2 mt-1 text-white/90">
              <Mail className="w-4 h-4" />
              <span className="text-sm truncate">{profile.email || 'Sin email'}</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
                <Shield className="w-3.5 h-3.5" />
                {colors.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                {isJuridica ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {isJuridica ? 'Jurídica' : 'Natural'}
              </span>
            </div>
          </div>

          {/* Botón Editar */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-medium transition-all"
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Grid de Información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identificación */}
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${colors.badge}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {isJuridica ? 'RUC' : 'Cédula'}
              </p>
              <p className={`font-semibold ${colors.text} truncate`}>
                {isJuridica ? profile.ruc : profile.cedula || 'No registrado'}
              </p>
            </div>
          </div>
        </div>

        {/* Teléfono */}
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${colors.badge}`}>
              <Phone className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
              <p className={`font-semibold ${colors.text} truncate`}>
                {profile.telefono || 'No registrado'}
              </p>
            </div>
          </div>
        </div>

        {/* Representante Legal (solo Jurídica) */}
        {isJuridica && profile.representante && (
          <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${colors.badge}`}>
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Representante Legal</p>
                <p className={`font-semibold ${colors.text} truncate`}>
                  {profile.representante}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fecha de Registro */}
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${colors.badge}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Miembro desde</p>
              <p className={`font-semibold ${colors.text}`}>
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dirección */}
      <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${colors.badge}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
            <p className={`font-medium ${colors.text} mt-1`}>
              {profile.direccion || 'No registrada'}
            </p>
            {profile.latitud && profile.longitud && (
              <p className="text-xs text-gray-400 mt-1">
                Lat: {profile.latitud.toFixed(6)}, Lng: {profile.longitud.toFixed(6)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mapa de Ubicación */}
      {showMap && profile.latitud && profile.longitud && (
        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className={`w-5 h-5 ${colors.text}`} />
            <h3 className={`font-semibold ${colors.text}`}>Ubicación en el mapa</h3>
          </div>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Cargando mapa...</span>
                </div>
              </div>
            }
          >
            <MapboxStaticMap
              latitude={profile.latitud}
              longitude={profile.longitud}
              address={profile.direccion}
              height="256px"
              className="rounded-lg overflow-hidden"
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
