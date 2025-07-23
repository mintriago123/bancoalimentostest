'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { 
  Search, 
  Filter, 
  User, 
  Building, 
  Phone, 
  Mail,
  Calendar,
  Shield,
  UserCheck,
  Users
} from 'lucide-react';

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
  email?: string;
  created_at?: string;
}

interface FiltroRol {
  todos: boolean;
  ADMINISTRADOR: boolean;
  DONANTE: boolean;
  SOLICITANTE: boolean;
}

interface FiltroTipoPersona {
  todos: boolean;
  Natural: boolean;
  Juridica: boolean;
}

export default function AdminUsuarios() {
  const { supabase } = useSupabase();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<FiltroRol>({
    todos: true,
    ADMINISTRADOR: false,
    DONANTE: false,
    SOLICITANTE: false
  });
  const [filtroTipoPersona, setFiltroTipoPersona] = useState<FiltroTipoPersona>({
    todos: true,
    Natural: false,
    Juridica: false
  });

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

  const aplicarFiltros = useCallback(() => {
    let filtrados = [...usuarios];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      filtrados = filtrados.filter(u => 
        u.nombre?.toLowerCase().includes(terminoBusqueda) ||
        u.cedula?.includes(terminoBusqueda) ||
        u.ruc?.includes(terminoBusqueda) ||
        u.telefono?.includes(terminoBusqueda) ||
        u.email?.toLowerCase().includes(terminoBusqueda) ||
        u.representante?.toLowerCase().includes(terminoBusqueda)
      );
    }

    // Filtro por rol
    if (!filtroRol.todos) {
      filtrados = filtrados.filter(u => {
        if (filtroRol.ADMINISTRADOR && u.rol === 'ADMINISTRADOR') return true;
        if (filtroRol.DONANTE && u.rol === 'DONANTE') return true;
        if (filtroRol.SOLICITANTE && u.rol === 'SOLICITANTE') return true;
        return false;
      });
    }

    // Filtro por tipo de persona
    if (!filtroTipoPersona.todos) {
      filtrados = filtrados.filter(u => {
        if (filtroTipoPersona.Natural && u.tipo_persona === 'Natural') return true;
        if (filtroTipoPersona.Juridica && u.tipo_persona === 'Juridica') return true;
        return false;
      });
    }

    setUsuariosFiltrados(filtrados);
  }, [usuarios, busqueda, filtroRol, filtroTipoPersona]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const cambiarRol = async (usuarioId: string, nuevoRol: string) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ rol: nuevoRol })
      .eq('id', usuarioId);

    if (!error) {
      await cargarUsuarios();
    }
  };

  const cambiarFiltroRol = (filtro: keyof FiltroRol) => {
    if (filtro === 'todos') {
      setFiltroRol({
        todos: true,
        ADMINISTRADOR: false,
        DONANTE: false,
        SOLICITANTE: false
      });
    } else {
      setFiltroRol(prev => ({
        ...prev,
        todos: false,
        [filtro]: !prev[filtro]
      }));
    }
  };

  const cambiarFiltroTipoPersona = (filtro: keyof FiltroTipoPersona) => {
    if (filtro === 'todos') {
      setFiltroTipoPersona({
        todos: true,
        Natural: false,
        Juridica: false
      });
    } else {
      setFiltroTipoPersona(prev => ({
        ...prev,
        todos: false,
        [filtro]: !prev[filtro]
      }));
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR': return 'bg-red-100 text-red-800 border-red-200';
      case 'DONANTE': return 'bg-green-100 text-green-800 border-green-200';
      case 'SOLICITANTE': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case 'ADMINISTRADOR': return <Shield className="w-4 h-4" />;
      case 'DONANTE': return <UserCheck className="w-4 h-4" />;
      case 'SOLICITANTE': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getTipoPersonaIcon = (tipo: string) => {
    return tipo === 'Juridica' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContadorPorRol = () => {
    const contador = {
      ADMINISTRADOR: 0,
      DONANTE: 0,
      SOLICITANTE: 0,
      TOTAL: usuarios.length
    };

    usuarios.forEach(u => {
      contador[u.rol as keyof typeof contador]++;
    });

    return contador;
  };

  const getContadorPorTipo = () => {
    const contador = {
      Natural: 0,
      Juridica: 0
    };

    usuarios.forEach(u => {
      contador[u.tipo_persona as keyof typeof contador]++;
    });

    return contador;
  };

  const contadorRol = getContadorPorRol();
  const contadorTipo = getContadorPorTipo();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-600 mt-1">Administra todos los usuarios del sistema</p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{contadorRol.TOTAL}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{contadorRol.ADMINISTRADOR}</div>
              <div className="text-xs text-red-600">Admins</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{contadorRol.DONANTE}</div>
              <div className="text-xs text-green-600">Donantes</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{contadorRol.SOLICITANTE}</div>
              <div className="text-xs text-purple-600">Solicitantes</div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, RUC, teléfono o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Filtros de rol */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Rol:</span>
              {Object.entries(filtroRol).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => cambiarFiltroRol(key as keyof FiltroRol)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    value 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {key === 'todos' ? 'Todos' : key}
                </button>
              ))}
            </div>

            {/* Filtros de tipo de persona */}
            <div className="flex items-center space-x-2">
              <Users className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              {Object.entries(filtroTipoPersona).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => cambiarFiltroTipoPersona(key as keyof FiltroTipoPersona)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {key === 'todos' ? 'Todos' : key}
                </button>
              ))}
            </div>
          </div>

          {/* Indicador de resultados */}
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </div>
        </div>

        {/* Tabla de usuarios */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Identificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {usuario.nombre ? usuario.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NN'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nombre || 'Sin nombre'}
                            </div>
                            {usuario.representante && (
                              <div className="text-sm text-gray-500">
                                Rep: {usuario.representante}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTipoPersonaIcon(usuario.tipo_persona)}
                          <div className="ml-2">
                            <div className="text-sm text-gray-900">
                              {usuario.cedula || usuario.ruc || 'No especificada'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {usuario.tipo_persona === 'Juridica' ? 'RUC' : 'Cédula'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {usuario.telefono || 'Sin teléfono'}
                          </div>
                          {usuario.email && (
                            <div className="flex items-center mt-1">
                              <Mail className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-xs">{usuario.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          usuario.tipo_persona === 'Juridica' 
                            ? 'bg-purple-100 text-purple-800 border-purple-200' 
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}>
                          {getTipoPersonaIcon(usuario.tipo_persona)}
                          <span className="ml-1">
                            {usuario.tipo_persona === 'Juridica' ? 'Jurídica' : 'Natural'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRolColor(usuario.rol)}`}>
                          {getRolIcon(usuario.rol)}
                          <span className="ml-1">{usuario.rol}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {formatearFecha(usuario.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          {usuario.rol !== 'ADMINISTRADOR' && (
                            <button
                              onClick={() => cambiarRol(usuario.id, 'ADMINISTRADOR')}
                              className="text-red-600 hover:text-red-500 px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-xs transition-colors"
                              title="Hacer Administrador"
                            >
                              Admin
                            </button>
                          )}
                          {usuario.rol !== 'DONANTE' && (
                            <button
                              onClick={() => cambiarRol(usuario.id, 'DONANTE')}
                              className="text-green-600 hover:text-green-500 px-2 py-1 rounded border border-green-200 hover:bg-green-50 text-xs transition-colors"
                              title="Hacer Donante"
                            >
                              Donante
                            </button>
                          )}
                          {usuario.rol !== 'SOLICITANTE' && (
                            <button
                              onClick={() => cambiarRol(usuario.id, 'SOLICITANTE')}
                              className="text-blue-600 hover:text-blue-500 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 text-xs transition-colors"
                              title="Hacer Solicitante"
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
              
              {usuariosFiltrados.length === 0 && usuarios.length > 0 && (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados</p>
                  <button
                    onClick={() => {
                      setBusqueda('');
                      setFiltroRol({ todos: true, ADMINISTRADOR: false, DONANTE: false, SOLICITANTE: false });
                      setFiltroTipoPersona({ todos: true, Natural: false, Juridica: false });
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {usuarios.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hay usuarios registrados en el sistema</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Personas Naturales</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorTipo.Natural}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Personas Jurídicas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorTipo.Juridica}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Rol</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-600">Administradores</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorRol.ADMINISTRADOR}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Donantes</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorRol.DONANTE}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Solicitantes</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorRol.SOLICITANTE}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
