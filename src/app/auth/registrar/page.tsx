'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { Iconos } from '@/app/components/ui/Iconos'; // asegúrate de que este path es el correcto

type RolSeleccionado = 'DONANTE' | 'SOLICITANTE' | null;

export default function PaginaRegistroSimple() {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [rolSeleccionado, setRolSeleccionado] = useState<RolSeleccionado>(null);
  const [datos, setDatos] = useState({ email: '', contrasena: '', confirmar: '' });
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos(d => ({ ...d, [e.target.name]: e.target.value }));
    setError(null);
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolSeleccionado) return setError('Debes seleccionar un rol');
    if (datos.contrasena !== datos.confirmar) return setError('Las contraseñas no coinciden');
    setCargando(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: datos.email,
      password: datos.contrasena,
      options: { data: { rol: rolSeleccionado } }
    });
    setCargando(false);
    if (error) return setError(error.message);

    if (data && data.user) {
      const { error: upsertError } = await supabase.from('usuarios').upsert({
        id: data.user.id,
        rol: rolSeleccionado
      });
      if (upsertError) return setError("Error creando perfil: " + upsertError.message);
    }

    setExito('¡Revisa tu correo y valida tu cuenta antes de continuar!');
  };

  if (exito) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">¡Registro exitoso!</h2>
        <p>{exito}</p>
        <Link href="/auth/iniciar-sesion" className="text-blue-600 underline">Ir al inicio de sesión</Link>
      </div>
    );
  }

  return (
    <form className="space-y-4 max-w-md mx-auto" onSubmit={manejarEnvio}>
      <h2 className="text-2xl font-bold text-center">Registro</h2>
      {!rolSeleccionado && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRolSeleccionado('DONANTE')}
            className="rol-button"
          >
            <Iconos.Donante />
            <span className="font-bold text-xl">Soy un Donante</span>
            <p className="text-sm text-gray-600 mt-2">Quiero ofrecer productos y ayuda.</p>
          </button>
          <button
            type="button"
            onClick={() => setRolSeleccionado('SOLICITANTE')}
            className="rol-button"
          >
            <Iconos.Solicitante />
            <span className="font-bold text-xl">Soy un Solicitante</span>
            <p className="text-sm text-gray-600 mt-2">Necesito recibir productos y ayuda.</p>
          </button>
        </div>
      )}
      {rolSeleccionado && (
        <>
          <input type="hidden" name="rol" value={rolSeleccionado} />
          <p className="text-center text-gray-500">Rol: <b>{rolSeleccionado}</b></p>
          <input
            name="email"
            type="email"
            required
            placeholder="Correo"
            className="w-full border p-2 rounded"
            value={datos.email}
            onChange={manejarCambio}
          />
          <input
            name="contrasena"
            type="password"
            required
            placeholder="Contraseña"
            className="w-full border p-2 rounded"
            value={datos.contrasena}
            onChange={manejarCambio}
          />
          <input
            name="confirmar"
            type="password"
            required
            placeholder="Confirmar contraseña"
            className="w-full border p-2 rounded"
            value={datos.confirmar}
            onChange={manejarCambio}
          />
          {error && <div className="text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {cargando ? 'Creando...' : 'Crear cuenta'}
          </button>
          <button
            type="button"
            onClick={() => setRolSeleccionado(null)}
            className="text-sm text-blue-600 underline w-full mt-2"
          >
            Cambiar rol
          </button>
        </>
      )}
      {/* Estilos para los botones de rol e íconos */}
      <style jsx>{`
        .rol-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background-color: white;
          text-align: center;
          transition: all 0.2s ease-in-out;
        }
        .rol-button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: #3b82f6;
        }
      `}</style>
    </form>
  );
}