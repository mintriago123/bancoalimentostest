'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { validarCedulaEcuatoriana, validarRucEcuatoriano } from '@/lib/validaciones';

// Extrae expedición y expiración para natural
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
    fechaExpedicion: getCampo('fechaExpedicion') || getCampo('fecha_expedicion'),
    fechaExpiracion: getCampo('fechaExpiracion') || getCampo('fecha_expiracion'),
  };
}

// Extrae expedición y expiración para jurídica
function extraerDatosRuc(respuesta: any) {
  const s5383 = respuesta?.["Servicio 5383"];
  const s5387 = respuesta?.["Servicio 5387"];
  const datosRepre = s5387?.["Datos Representante Legal"];
  return {
    razonSocial: s5383?.["Razon Social"] || "",
    direccion: s5383?.["Descripcion Ubicacion Geo"] || "",
    representante: s5387?.["Nombre Repre Legal"] || "",
    cedulaRepresentante: datosRepre?.["Cedula"] || "",
    fechaExpedicionRepresentante: datosRepre?.["Fecha Expedicion"] || "",
    fechaExpiracionRepresentante: datosRepre?.["Fecha Expiracion"] || "",
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
    fechaEmisionIngresada: '',
    fechaExpRepreIngresada: '',
  });

  // Arrays de fechas válidas para natural y jurídica
  const [fechasValidasNatural, setFechasValidasNatural] = useState<string[]>([]);
  const [fechasValidasJuridica, setFechasValidasJuridica] = useState<string[]>([]);

  const [consultando, setConsultando] = useState(false);
  const [nombreBloqueado, setNombreBloqueado] = useState(false);
  const [identificacionValidada, setIdentificacionValidada] = useState(false);
  const [validacionDocumento, setValidacionDocumento] = useState<{ esValido: boolean; mensaje: string | null }>({ esValido: false, mensaje: null });
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  // Formateo automático y validación de fecha tipo DD/MM/AAAA
  const manejarCambioFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Solo números
    if (value.length > 8) value = value.slice(0, 8);

    // Validar días y meses en el input
    let dia = value.slice(0, 2);
    let mes = value.slice(2, 4);
    let anio = value.slice(4, 8);

    if (dia) {
      let nDia = parseInt(dia, 10);
      if (nDia > 31) dia = "31";
      if (nDia < 1 && dia.length === 2) dia = "01";
    }
    if (mes) {
      let nMes = parseInt(mes, 10);
      if (nMes > 12) mes = "12";
      if (nMes < 1 && mes.length === 2) mes = "01";
    }

    let nuevaFecha = dia;
    if (mes) nuevaFecha += "/" + mes;
    if (anio) nuevaFecha += "/" + anio;

    setForm(prev => ({
      ...prev,
      [e.target.name]: nuevaFecha,
    }));
    setError(null);
  };

  // Validación de número de teléfono: debe ser de 10 dígitos numéricos
  const validarTelefono = (telefono: string) => {
    const soloNumeros = telefono.replace(/\D/g, "");
    return soloNumeros.length === 10 && /^[0-9]+$/.test(soloNumeros);
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        const url = `${process.env.NEXT_PUBLIC_SERVICIO_CONSULTAS_DINARAP}?identificacion=${numero}`;
        const respuesta = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const datos = await respuesta.json();
        const datosDemograficos = extraerDatosDemograficos(datos);
        // Guardar fechas válidas (expedición o expiración si existen)
        setFechasValidasNatural([
          datosDemograficos.fechaExpedicion,
          datosDemograficos.fechaExpiracion,
        ].filter(Boolean));

        if (respuesta.ok && datosDemograficos && datosDemograficos.nombre) {
          setForm(prev => ({
            ...prev,
            nombre: datosDemograficos.nombre,
            cedula: datosDemograficos.cedula || prev.cedula,
            ruc: prev.ruc,
          }));
          setNombreBloqueado(true);
          setIdentificacionValidada(false);
          setValidacionDocumento({
            esValido: false,
            mensaje: "Por favor, ingresa la fecha de emisión o expiración de tu cédula para continuar."
          });
          setExito(null);
        } else {
          setNombreBloqueado(false);
          setIdentificacionValidada(false);
          setValidacionDocumento({ esValido: false, mensaje: 'Puedes ingresar los datos manualmente.' });
          setFechasValidasNatural([]);
        }
      } else {
        const url = `${process.env.NEXT_PUBLIC_SERVICIO_CONSULTAS_RUC}?ruc=${numero}`;
        const respuesta = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const datos = await respuesta.json();
        const datosRuc = extraerDatosRuc(datos);
        setFechasValidasJuridica([
          datosRuc.fechaExpedicionRepresentante,
          datosRuc.fechaExpiracionRepresentante,
        ].filter(Boolean));

        if (respuesta.ok && datosRuc.razonSocial) {
          setForm(prev => ({
            ...prev,
            nombre: datosRuc.razonSocial,
            direccion: datosRuc.direccion,
          }));
          setNombreBloqueado(true);
          setIdentificacionValidada(false);
          setValidacionDocumento({
            esValido: false,
            mensaje: "Por favor, ingresa la fecha de emisión o expiración de la cédula del representante legal para continuar."
          });
          setExito(null);
        } else {
          setNombreBloqueado(false);
          setIdentificacionValidada(false);
          setValidacionDocumento({ esValido: false, mensaje: 'Puedes ingresar los datos manualmente.' });
          setFechasValidasJuridica([]);
        }
      }
    } catch {
      setNombreBloqueado(false);
      setIdentificacionValidada(false);
      setError('No se pudo consultar la identificación.');
      setFechasValidasNatural([]);
      setFechasValidasJuridica([]);
    } finally {
      setConsultando(false);
    }
  };

  // Normaliza fecha
  const normalizar = (fecha: string) => fecha.replace(/[-/]/g, '').trim().toLowerCase();

  // Valida para natural: coincide con alguna de las fechas válidas
  const validarFechaNatural = () => {
    if (!fechasValidasNatural.length || !form.fechaEmisionIngresada) return false;
    return fechasValidasNatural.some(
      f => normalizar(form.fechaEmisionIngresada) === normalizar(f)
    );
  };

  // Valida para jurídica: coincide con alguna de las fechas válidas del representante
  const validarFechaJuridica = () => {
    if (!fechasValidasJuridica.length || !form.fechaExpRepreIngresada) return false;
    return fechasValidasJuridica.some(
      f => normalizar(form.fechaExpRepreIngresada) === normalizar(f)
    );
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (form.tipo_persona === 'Natural' && !form.cedula) {
      setError("La cédula es obligatoria.");
      return;
    }
    if (form.tipo_persona === 'Juridica' && !form.ruc) {
      setError("El RUC es obligatorio.");
      return;
    }

    if (!form.telefono || !validarTelefono(form.telefono)) {
      setError("El número de teléfono es obligatorio y debe tener 10 dígitos.");
      return;
    }

    // Validación natural usando ambas fechas posibles
    if (form.tipo_persona === 'Natural' && fechasValidasNatural.length) {
      if (!form.fechaEmisionIngresada) {
        setError("Debes ingresar la fecha de emisión o expiración de tu cédula.");
        return;
      }
      if (!validarFechaNatural()) {
        setError("La fecha de emisión o expiración no coincide con la registrada.");
        return;
      }
    }
    // Validación jurídica usando ambas fechas posibles
    if (form.tipo_persona === 'Juridica' && fechasValidasJuridica.length) {
      if (!form.fechaExpRepreIngresada) {
        setError("Debes ingresar la fecha de emisión o expiración de la cédula del representante legal.");
        return;
      }
      if (!validarFechaJuridica()) {
        setError("La fecha de emisión o expiración del representante legal no coincide con la registrada.");
        return;
      }
    }

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      <form
        className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 p-8 space-y-6"
        onSubmit={manejarEnvio}
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-4">
          Completa tu Perfil
        </h2>

        {/* Selector visual de tipo de persona */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2 text-center">
            Tipo de Persona <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4 mb-2">
            <button
              type="button"
              className={`flex flex-col items-center justify-center px-0 py-4 rounded-xl border-2 transition-all font-medium
                ${form.tipo_persona === 'Natural'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'}
              `}
              onClick={() => setForm(f => ({ ...f, tipo_persona: 'Natural' }))}
            >
              Natural
              <span className="block text-xs font-normal mt-1">Cédula</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center justify-center px-0 py-4 rounded-xl border-2 transition-all font-medium
                ${form.tipo_persona === 'Juridica'
                  ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'}
              `}
              onClick={() => setForm(f => ({ ...f, tipo_persona: 'Juridica' }))}
            >
              Jurídica
              <span className="block text-xs font-normal mt-1">RUC</span>
            </button>
          </div>
        </div>

        {/* Documento de identidad */}
        <div>
          <label htmlFor={form.tipo_persona === 'Natural' ? 'cedula' : 'ruc'} className="font-semibold text-gray-700 block mb-1">
            {form.tipo_persona === 'Natural' ? 'Cédula' : 'RUC'} <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name={form.tipo_persona === 'Natural' ? 'cedula' : 'ruc'}
              id={form.tipo_persona === 'Natural' ? 'cedula' : 'ruc'}
              type="text"
              maxLength={form.tipo_persona === 'Natural' ? 10 : 13}
              placeholder={form.tipo_persona === 'Natural' ? 'Cédula' : 'RUC'}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              value={form.tipo_persona === 'Natural' ? form.cedula : form.ruc}
              onChange={manejarCambio}
            />
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-all"
              disabled={consultando}
              onClick={consultarIdentificacion}
            >
              {consultando ? "..." : "Consultar"}
            </button>
          </div>
          {validacionDocumento.mensaje && (
            <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${
              validacionDocumento.mensaje.includes("Por favor, ingresa la fecha de emisión o expiración")
                ? "text-blue-700 bg-blue-100"
                : validacionDocumento.esValido
                  ? "text-green-700 bg-green-100"
                  : "text-red-600 bg-red-100"
            }`}>
              {validacionDocumento.mensaje}
            </div>
          )}
        </div>

        {/* FECHA DE EMISIÓN / EXPIRACIÓN - NATURAL */}
        {form.tipo_persona === 'Natural' && fechasValidasNatural.length > 0 && (
          <div>
            <label htmlFor="fechaEmisionIngresada" className="font-semibold text-gray-700 block mb-1">
              Fecha de emisión o expiración de la cédula <span className="text-red-600">*</span>
            </label>
              <input
                name="fechaEmisionIngresada"
                id="fechaEmisionIngresada"
                type="text"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={form.fechaEmisionIngresada}
                onChange={manejarCambioFecha}
                inputMode="numeric"
                autoComplete="off"
              />

            <div className="text-xs text-gray-500 mt-1">
              Puedes ingresar la fecha de emisión <b>o</b> expiración de tu cédula.
            </div>
            {form.fechaEmisionIngresada && !validarFechaNatural() && (
              <div className="text-sm text-red-600 mt-1">La fecha ingresada no coincide con los registros oficiales.</div>
            )}
            {form.fechaEmisionIngresada && validarFechaNatural() && (
              <div className="text-sm text-green-700 mt-1">Fecha verificada correctamente.</div>
            )}
          </div>
        )}

        {/* FECHA DE EMISIÓN / EXPIRACIÓN REPRESENTANTE LEGAL - JURÍDICA SOLO DESPUÉS DE CONSULTA */}
        {form.tipo_persona === 'Juridica' && nombreBloqueado && fechasValidasJuridica.length > 0 && (
          <div>
            <label htmlFor="fechaExpRepreIngresada" className="font-semibold text-gray-700 block mb-1">
              Fecha de emisión o expiración de la cédula del representante legal <span className="text-red-600">*</span>
            </label>
              <input
                name="fechaExpRepreIngresada"
                id="fechaExpRepreIngresada"
                type="text"
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={form.fechaExpRepreIngresada}
                onChange={manejarCambioFecha}
                inputMode="numeric"
                autoComplete="off"
              />
            <div className="text-xs text-gray-500 mt-1">
              Puedes ingresar la fecha de emisión <b>o</b> expiración de la cédula del representante legal.
              {fechasValidasJuridica.length === 0 && (
                <span className="block text-red-500 mt-1">
                  (No se pudo obtener la fecha oficial, se guardará tu dato pero no se validará)
                </span>
              )}
            </div>
            {form.fechaExpRepreIngresada && fechasValidasJuridica.length > 0 && !validarFechaJuridica() && (
              <div className="text-sm text-red-600 mt-1">La fecha ingresada no coincide con los registros oficiales.</div>
            )}
            {form.fechaExpRepreIngresada && fechasValidasJuridica.length > 0 && validarFechaJuridica() && (
              <div className="text-sm text-green-700 mt-1">Fecha verificada correctamente.</div>
            )}
          </div>
        )}

        <div>
          <label htmlFor="nombre" className="font-semibold text-gray-700 block mb-1">
            Nombre o Razón Social <span className="text-red-600">*</span>
          </label>
          <input
            name="nombre"
            id="nombre"
            type="text"
            placeholder="Nombre o Razón Social"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.nombre}
            onChange={manejarCambio}
            disabled={nombreBloqueado}
          />
        </div>
        <div>
          <label htmlFor="direccion" className="font-semibold text-gray-700 block mb-1">
            Dirección <span className="text-red-600">*</span>
          </label>
          <input
            name="direccion"
            id="direccion"
            type="text"
            placeholder="Dirección"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.direccion}
            onChange={manejarCambio}
          />
        </div>
        <div>
          <label htmlFor="telefono" className="font-semibold text-gray-700 block mb-1">
            Teléfono <span className="text-red-600">*</span>
          </label>
          <input
            name="telefono"
            id="telefono"
            type="tel"
            placeholder="Teléfono"
            maxLength={10}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.telefono}
            onChange={manejarCambio}
            inputMode="numeric"
            autoComplete="off"
          />
        </div>

        {error && <div className="text-center text-red-700 bg-red-100 py-2 px-3 rounded-lg">{error}</div>}
        {exito && <div className="text-center text-green-700 bg-green-100 py-2 px-3 rounded-lg">{exito}</div>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition-all"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}