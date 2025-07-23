'use client';

import { useSupabase } from '@/app/components/SupabaseProvider';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import Link from 'next/link';

export default function UsuarioDashboardPage() {
  const { user, supabase } = useSupabase();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const obtenerNombre = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('nombre')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setNombre(data.nombre);
      }
    };

    obtenerNombre();
  }, [user, supabase]);

  return (
    <DashboardLayout
      requiredRole="DONANTE"
      title="Inicio del Usuario"
      description="Panel principal con acceso a tus funcionalidades."
    >
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-800">
            ¡Bienvenido, {nombre || 'Usuario'}!
          </h2>
          <p className="text-gray-600 mt-2">
            Este es tu panel donde puedes gestionar tu perfil, reservas y más.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/donante/perfil">
            <div className="bg-blue-50 hover:bg-blue-100 transition rounded-xl p-4 shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-blue-700">Ver Perfil</h3>
              <p className="text-sm text-blue-600">Consulta tu información personal.</p>
            </div>
          </Link>


          <Link href="/donante/solicitudes">
            <div className="bg-purple-50 hover:bg-purple-100 transition rounded-xl p-4 shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-purple-700">Ver solicitudes</h3>
              <p className="text-sm text-purple-600">Consulta el estado de tus solicitudes.</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
