'use client';

import { useState } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useConfirm } from '@/modules/admin/shared/hooks/useConfirm';
import {
  useSolicitudes,
  SolicitudesList,
  FiltroEstadoSolicitud,
  Solicitud,
  SolicitudEditData,
  MESSAGES,
} from '@/modules/user';

export default function MisSolicitudesPage() {
  const { supabase, user } = useSupabase();
  const confirm = useConfirm();
  const [mensaje, setMensaje] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoSolicitud>('TODOS');

  const {
    solicitudes,
    updateSolicitud,
    deleteSolicitud,
  } = useSolicitudes(supabase, user?.id, filtroEstado);

  const handleEliminar = async (solicitud: Solicitud) => {
    const confirmed = await confirm({
      title: 'Eliminar solicitud',
      description: `Se eliminará la solicitud de ${solicitud.tipo_alimento ?? 'alimentos'} con cantidad ${solicitud.cantidad}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      cancelLabel: 'Cancelar',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    const success = await deleteSolicitud(solicitud.id);
    
    if (success) {
      setMensaje(MESSAGES.SOLICITUD.SUCCESS_DELETE);
    } else {
      setMensaje(MESSAGES.SOLICITUD.ERROR_DELETE);
    }
    
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleEditar = async (id: number, data: SolicitudEditData): Promise<boolean> => {
    if (data.cantidad <= 0) {
      setMensaje(MESSAGES.VALIDATION.CANTIDAD_INVALID);
      setTimeout(() => setMensaje(''), 3000);
      return false;
    }

    const success = await updateSolicitud(id, data);
    
    if (success) {
      setMensaje(MESSAGES.SOLICITUD.SUCCESS_UPDATE);
    } else {
      setMensaje(MESSAGES.SOLICITUD.ERROR_UPDATE);
    }
    
    setTimeout(() => setMensaje(''), 3000);
    return success;
  };

  return (
    <DashboardLayout
      requiredRole="SOLICITANTE"
      title="Mis Solicitudes"
      description="Revisa el historial de tus solicitudes de alimentos."
    >
      <SolicitudesList
        solicitudes={solicitudes}
        filtroEstado={filtroEstado}
        onFiltroChange={setFiltroEstado}
        onDelete={handleEliminar}
        onEdit={handleEditar}
        mensaje={mensaje}
      />
    </DashboardLayout>
  );
}
