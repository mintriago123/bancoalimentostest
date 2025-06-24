'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { Iconos } from '@/app/components/ui/Iconos';
import { CLASES_ESTILO, MENSAJES, CONFIGURACION } from '@/lib/constantes';
import { validarCedulaEcuatoriana, validarRucEcuatoriano } from '@/lib/validaciones';

// Función para extraer datos de cédula (DINA-RAP)
function extraerDatosDemograficos(apiResponse: any) {
  const entidad = apiResponse?.paquete?.entidades?.entidad?.[0];
  const fila = entidad?.filas?.fila?.[0];
  const columnas = fila?.columnas?.columna;
  const getCampo = (campo: string) =>
    columnas?.find((col: any) => col.campo === campo)?.valor || '';
  return {
    nombre: getCampo('nombre'),
    cedula: getCampo('cedula'),
    estadoCivil: getCampo('estadoCivil'),
    profesion: getCampo('profesion'),
    fechaNacimiento: getCampo('fechaNacimiento'),
    lugarNacimiento: getCampo('lugarNacimiento'),
  };
}

// Función para extraer datos de RUC (nuevo endpoint)
function extraerDatosRuc(respuesta: any) {
  const s5383 = respuesta?.["Servicio 5383"];
  const s5387 = respuesta?.["Servicio 5387"];
  return {
    razonSocial: s5383?.["Razon Social"] || "",
    direccion: s5383?.["Descripcion Ubicacion Geo"] || "",
    representante: s5387?.["Nombre Repre Legal"] || "",
  };
}

export default function CompletarPerfil() {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [form, setForm] = useState({
    tipo_persona: 'Natural',
    cedula: '',
    ruc: '',
    nombre: '',
    direccion: '',
    telefono: '',
  });
  const [consultando, setConsultando] = useState(false);
  const [nombreBloqueado, setNombreBloqueado] = useState(false);
  const [identificacionValidada, setIdentificacionValidada] = useState(false);
  const [validacionDocumento, setValidacionDocumento] = useState<{ esValido: boolean; mensaje: string | null }>({ esValido: false, mensaje: null });
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  const clasesInput = "block w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white/70 border border-gray-300/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200";
  const clasesLabel = "block mb-2 text-sm font-bold text-gray-700";
  const clasesBoton = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50";

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cedula' || name === 'ruc') {
      const soloNumeros = value.replace(/\D/g, '');
      const longitudMaxima = name === 'cedula' ? 10 : 13;
      if (soloNumeros.length <= longitudMaxima) {
        setForm((prev) => ({ ...prev, [name]: soloNumeros }));
        setIdentificacionValidada(false);
        setValidacionDocumento({ esValido: false, mensaje: null });
        setNombreBloqueado(false);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const consultarIdentificacion = async () => {
    const numero = form.tipo_persona === 'Natural' ? form.cedula : form.ruc;
    if (!numero || numero.length < (form.tipo_persona === 'Natural' ? 10 : 13)) {
      setError('Ingrese un documento válido.');
      return;
    }

    let esValido = false;
    if (form.tipo_persona === 'Natural') {
      esValido = validarCedulaEcuatoriana(numero);
    } else {
      esValido = validarRucEcuatoriano(numero);
    }
    if (!esValido) {
      setValidacionDocumento({
        esValido: false,
        mensaje: form.tipo_persona === 'Natural'
          ? 'La cédula ingresada no es válida.'
          : 'El RUC ingresado no es válido.',
      });
      setIdentificacionValidada(false);
      setNombreBloqueado(false);
      return;
    }

    setConsultando(true);
    setError(null);

    try {
      if (form.tipo_persona === 'Natural') {
        // Consulta cédula normal
        const url = `${process.env.NEXT_PUBLIC_SERVICIO_CONSULTAS_DINARAP}?identificacion=${numero}`;
        const respuesta = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const datos = await respuesta.json();
        const datosDemograficos = extraerDatosDemograficos(datos);

        if (respuesta.ok && datosDemograficos && datosDemograficos.nombre) {
          const nombreObtenido = datosDemograficos.nombre;
          if (nombreObtenido && nombreObtenido.trim() !== '' && nombreObtenido !== 'No disponible') {
            setForm(prev => ({
              ...prev,
              nombre: datosDemograficos.nombre,
              cedula: datosDemograficos.cedula || prev.cedula,
              ruc: prev.ruc,
            }));
            setNombreBloqueado(true);
            setIdentificacionValidada(true);
            setValidacionDocumento({ esValido: true, mensaje: null });
            setExito('Datos obtenidos correctamente.');
          } else {
            setNombreBloqueado(false);
            setIdentificacionValidada(true);
            setValidacionDocumento({ esValido: true, mensaje: 'Puedes ingresar los datos manualmente.' });
          }
        } else {
          setNombreBloqueado(false);
          setIdentificacionValidada(true);
          setValidacionDocumento({ esValido: true, mensaje: 'Puedes ingresar los datos manualmente.' });
        }
      } else {
        // Consulta RUC con endpoint y variable de entorno
        const url = `${process.env.NEXT_PUBLIC_SERVICIO_CONSULTAS_RUC}?ruc=${numero}`;
        const respuesta = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const datos = await respuesta.json();
        const datosRuc = extraerDatosRuc(datos);

        if (respuesta.ok && datosRuc.razonSocial) {
          setForm(prev => ({
            ...prev,
            nombre: datosRuc.razonSocial,
            direccion: datosRuc.direccion,
            // puedes guardar el representante en otro campo si deseas
          }));
          setNombreBloqueado(true);
          setIdentificacionValidada(true);
          setValidacionDocumento({
            esValido: true,
            mensaje: datosRuc.representante
              ? `Representante Legal: ${datosRuc.representante}`
              : null
          });
          setExito('Datos de empresa obtenidos correctamente.');
        } else {
          setNombreBloqueado(false);
          setIdentificacionValidada(true);
          setValidacionDocumento({ esValido: true, mensaje: 'Puedes ingresar los datos manualmente.' });
        }
      }
    } catch {
      setNombreBloqueado(false);
      setIdentificacionValidada(false);
      setError('No se pudo consultar la identificación.');
    } finally {
      setConsultando(false);
    }
  };

  // Nuevo: Handler para guardar perfil en la DB
  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    // Validar que la cédula no esté vacía
    if (form.tipo_persona === 'Natural' && !form.cedula) {
      setError("La cédula es obligatoria.");
      return;
    }
    if (form.tipo_persona === 'Juridica' && !form.ruc) {
      setError("El RUC es obligatorio.");
      return;
    }

    // Obtener usuario autenticado
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.id) {
      setError("No se pudo obtener el usuario autenticado.");
      return;
    }
    const userId = userData.user.id;

    // Validar que la cédula o RUC no se repita en otro usuario
    if (form.tipo_persona === 'Natural') {
      const { data: existente } = await supabase
        .from("usuarios")
        .select("id")
        .eq("cedula", form.cedula)
        .neq("id", userId)
        .maybeSingle();
      if (existente) {
        setError("Ya existe un usuario con esa cédula.");
        return;
      }
    }
    if (form.tipo_persona === 'Juridica') {
      const { data: existente } = await supabase
        .from("usuarios")
        .select("id")
        .eq("ruc", form.ruc)
        .neq("id", userId)
        .maybeSingle();
      if (existente) {
        setError("Ya existe un usuario con ese RUC.");
        return;
      }
    }

    // Actualizar el perfil en la tabla usuarios
    const { error: updateError } = await supabase
      .from("usuarios")
      .update({
        tipo_persona: form.tipo_persona,
        cedula: form.cedula || null,
        ruc: form.ruc || null,
        nombre: form.nombre,
        direccion: form.direccion,
        telefono: form.telefono,
      })
      .eq("id", userId);

    if (updateError) {
      setError("No se pudo guardar el perfil. " + updateError.message);
    } else {
      setExito("¡Perfil guardado correctamente!");
      router.push("/");
    }
  };

  return (
    <form className="space-y-6 max-w-md mx-auto bg-white/90 shadow-lg rounded-xl p-6 mt-8" onSubmit={manejarEnvio}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Completa tu Perfil
        </h2>
      </div>
      <div>
        <label htmlFor="tipo_persona" className={clasesLabel}>Tipo de Persona</label>
        <select
          name="tipo_persona"
          id="tipo_persona"
          value={form.tipo_persona}
          onChange={manejarCambio}
          className={clasesInput}
        >
          <option value="Natural">Natural (Cédula)</option>
          <option value="Juridica">Jurídica (RUC)</option>
        </select>
      </div>
      <div>
        <label htmlFor={form.tipo_persona === 'Natural' ? 'cedula' : 'ruc'} className={clasesLabel}>
          {form.tipo_persona === 'Natural' ? 'Cédula' : 'RUC'}
        </label>
        <div className="flex gap-2">
          <input
            name={form.tipo_persona === 'Natural' ? 'cedula' : 'ruc'}
            id={form.tipo_persona === 'Natural' ? 'cedula' : 'ruc'}
            type="text"
            maxLength={form.tipo_persona === 'Natural' ? 10 : 13}
            placeholder={form.tipo_persona === 'Natural' ? 'Cédula' : 'RUC'}
            className={clasesInput}
            value={form.tipo_persona === 'Natural' ? form.cedula : form.ruc}
            onChange={manejarCambio}
          />
          <button
            type="button"
            className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg shadow-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none disabled:opacity-50"
            disabled={consultando}
            onClick={consultarIdentificacion}
          >
            {consultando ? "Consultando..." : "Consultar"}
          </button>
        </div>
        {validacionDocumento.mensaje && (
          <div className={`mt-2 text-sm rounded-lg p-3 ${validacionDocumento.esValido ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"}`}>
            {validacionDocumento.mensaje}
          </div>
        )}
      </div>
      <div>
        <label htmlFor="nombre" className={clasesLabel}>Nombre o Razón Social</label>
        <input
          name="nombre"
          id="nombre"
          type="text"
          placeholder="Nombre o Razón Social"
          className={clasesInput}
          value={form.nombre}
          onChange={manejarCambio}
          disabled={nombreBloqueado}
        />
      </div>
      {form.tipo_persona === 'Juridica' && validacionDocumento.esValido && validacionDocumento.mensaje && (
        <div className="text-sm text-blue-700 bg-blue-100 rounded-lg p-2 mt-2">
          {validacionDocumento.mensaje}
        </div>
      )}
      <div>
        <label htmlFor="direccion" className={clasesLabel}>Dirección</label>
        <input
          name="direccion"
          id="direccion"
          type="text"
          placeholder="Dirección"
          className={clasesInput}
          value={form.direccion}
          onChange={manejarCambio}
        />
      </div>
      <div>
        <label htmlFor="telefono" className={clasesLabel}>Teléfono</label>
        <input
          name="telefono"
          id="telefono"
          type="tel"
          placeholder="Teléfono"
          className={clasesInput}
          value={form.telefono}
          onChange={manejarCambio}
        />
      </div>
      {error && <div className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</div>}
      {exito && <div className="text-sm text-center text-green-700 bg-green-100 p-3 rounded-lg">{exito}</div>}
      <div>
        <button type="submit" className={clasesBoton}>
          Guardar
        </button>
      </div>
    </form>
  );
}