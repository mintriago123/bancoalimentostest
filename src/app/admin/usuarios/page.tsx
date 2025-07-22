'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';

interface Usuario {
  id: string;
  nombre: string;
  cedula?: string;
  ruc?: string;
  rol: string;
  tipo_persona: string;
  telefono: string;
  direccion: string;
  representante?: string;
}

export default function AdminUsuarios() {
  const { supabase } = useSupabase();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error && data) {
      setUsuarios(data);
    }
    setCargando(false);
  }, [supabase]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const cambiarRol = async (usuarioId: string, nuevoRol: string) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId);

    if (!error) {
      await cargarUsuarios();
    }
  };

  const getRolColor = (rol: string) => {
    if (rol === 'ADMINISTRADOR') return 'bg-red-100 text-red-800';
    if (rol === 'DONANTE') return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800'; // SOLICITANTE
  };

  const getTipoPersonaLabel = (tipo: string) => {
    return tipo === 'JURIDICA' ? 'Jurídica' : 'Natural';
  };

  return (
    <DashboardLayout 
      requiredRole="ADMINISTRADOR"
      title="Gestión de Usuarios"
      description="Administra todos los usuarios del sistema"
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Todos los Usuarios</h2>
          <p className="text-sm text-gray-600">Administra roles y información de usuarios</p>
        </div>

        {cargando ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {usuario.nombre}
                      </div>
                      {usuario.representante && (
                        <div className="text-sm text-gray-500">
                          Rep: {usuario.representante}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {usuario.cedula || usuario.ruc || 'Sin identificación'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTipoPersonaLabel(usuario.tipo_persona)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolColor(usuario.rol)}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{usuario.telefono}</div>
                      <div className="text-sm text-gray-500 truncate max-w-32" title={usuario.direccion}>
                        {usuario.direccion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        {usuario.rol !== 'ADMINISTRADOR' && (
                          <button
                            onClick={() => cambiarRol(usuario.id, 'ADMINISTRADOR')}
                            className="text-red-600 hover:text-red-500 px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-xs"
                          >
                            Admin
                          </button>
                        )}
                        {usuario.rol !== 'DONANTE' && (
                          <button
                            onClick={() => cambiarRol(usuario.id, 'DONANTE')}
                            className="text-green-600 hover:text-green-500 px-2 py-1 rounded border border-green-200 hover:bg-green-50 text-xs"
                          >
                            Donante
                          </button>
                        )}
                        {usuario.rol !== 'SOLICITANTE' && (
                          <button
                            onClick={() => cambiarRol(usuario.id, 'SOLICITANTE')}
                            className="text-blue-600 hover:text-blue-500 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 text-xs"
                          >
                            Solicitante
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {usuarios.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">No hay usuarios registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Usuarios</h3>
          <p className="text-3xl font-bold text-gray-600">{usuarios.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Administradores</h3>
          <p className="text-3xl font-bold text-red-600">
            {usuarios.filter(u => u.rol === 'ADMINISTRADOR').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Donantes</h3>
          <p className="text-3xl font-bold text-green-600">
            {usuarios.filter(u => u.rol === 'DONANTE').length}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
