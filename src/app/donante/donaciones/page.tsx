'use client';

import { useEffect } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useModal, useDonationStats, useFilter } from '@/app/hooks';
import { useDonacionesData } from '@/modules/donante/donaciones/hooks';
import {
  DonacionesHeader,
  DonacionesStats,
  DonacionesFilters,
  DonacionesTable,
  DonacionDetalleModal,
  DonacionEdicionModal,
  DonacionesEmptyState,
} from '@/modules/donante/donaciones/components';
import { Donacion } from '@/modules/donante/donaciones/types';

export default function MisDonacionesPage() {
  const { supabase, user } = useSupabase();
  
  // Hook para gestión de donaciones
  const {
    donaciones,
    cargando,
    mensaje,
    cargarDonaciones,
    eliminarDonacion: eliminar,
    actualizarDonacion: actualizar,
  } = useDonacionesData(supabase, user);

  // Hooks para modales
  const modalEdicion = useModal<Donacion>();
  const modalDetalle = useModal<Donacion>();

  // Hook para filtros
  const { filtro: filtroEstado, setFiltro: setFiltroEstado, datosFiltrados: donacionesFiltradas } = useFilter<Donacion>(
    donaciones,
    (donacion, filtro) => donacion.estado === filtro,
    'todos'
  );

  // Hook para estadísticas
  const estadisticas = useDonationStats(donaciones);

  // Cargar donaciones al montar
  useEffect(() => {
    if (user) cargarDonaciones();
  }, [user, cargarDonaciones]);

  // Handlers
  const handleActualizarDonacion = async () => {
    if (!modalEdicion.data) return;
    const exito = await actualizar(modalEdicion.data);
    if (exito) {
      modalEdicion.close();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (modalEdicion.data) {
      modalEdicion.setData({ 
        ...modalEdicion.data, 
        [name]: name === 'cantidad' ? parseFloat(value) || 0 : value 
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <DonacionesHeader totalDonaciones={estadisticas.total} />

        {mensaje && (
          <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-md border border-blue-200">
            {mensaje}
          </div>
        )}

        <DonacionesStats stats={estadisticas} />

        <DonacionesFilters
          filtroEstado={filtroEstado}
          onFiltroChange={setFiltroEstado}
          totalDonaciones={donaciones.length}
          donacionesFiltradas={donacionesFiltradas.length}
        />

        {modalEdicion.isOpen && modalEdicion.data && (
          <DonacionEdicionModal
            donacion={modalEdicion.data}
            isOpen={modalEdicion.isOpen}
            onClose={modalEdicion.close}
            onSave={handleActualizarDonacion}
            onChange={handleChange}
          />
        )}

        {modalDetalle.isOpen && modalDetalle.data && (
          <DonacionDetalleModal
            donacion={modalDetalle.data}
            isOpen={modalDetalle.isOpen}
            onClose={modalDetalle.close}
          />
        )}

        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando donaciones...</p>
          </div>
        ) : donacionesFiltradas.length === 0 ? (
          <DonacionesEmptyState filtroEstado={filtroEstado} />
        ) : (
          <DonacionesTable
            donaciones={donacionesFiltradas}
            onVerDetalle={modalDetalle.open}
            onEditar={modalEdicion.open}
            onEliminar={eliminar}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
