'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSupabase } from '@/app/components/SupabaseProvider';

export default function InicioUsuario() {
  const { supabase, user } = useSupabase();
  const [solicitante, setSolicitante] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombre, cedula, correo, telefono, direccion')
            .eq('id', user.id)
            .single();
          if (error) throw new Error(error.message);
          setSolicitante(data);
        } catch (err) {
          console.error('Error al cargar los datos del usuario:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user, supabase]);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="flex">

      <div className="flex-1 bg-gray-100 p-4 space-y-6">
        <h2 className="text-2xl font-bold">Banco de Alimentos</h2>
        <div className="bg-white shadow rounded p-4 space-y-4">
          <div>
            <h3 className="font-semibold">Nombre del Banco de Alimentos</h3>
            <p>Banco de Alimentos</p>
          </div>
          <div>
            <h3 className="font-semibold">DESCRIPCION</h3>
            <p>SKJDNASJDKJASDJAKSDJASDJASN</p>
          </div>
        </div>
      </div>
    </div>
  );
}
