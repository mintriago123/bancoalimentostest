"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseProvider";
import {
  useIdentityValidation,
  useProfileForm,
  useDateFormatter,
  useProfileUpdate,
} from "@/modules/shared";
import { validarCedulaEcuatoriana, validarRucEcuatoriano } from "@/lib/validaciones";

export default function CompletarPerfil() {
  const router = useRouter();
  const { supabase } = useSupabase();

  // Custom hooks
  const {
    consultando,
    validacionDocumento,
    fechasValidasNatural,
    fechasValidasJuridica,
    consultarCedula,
    consultarRuc,
    resetValidation,
  } = useIdentityValidation();

  const {
    form,
    nombreBloqueado,
    handleChange,
    updateField,
    updateMultipleFields,
    resetForm,
    lockName,
    validateTelefono,
  } = useProfileForm();

  const {
    error,
    success: exito,
    setError,
    checkDuplicateIdentification,
    saveProfile,
  } = useProfileUpdate(supabase);

  const [identificacionValidada, setIdentificacionValidada] = useState(false);

  // Limpia el formulario al cambiar tipo_persona
  const limpiarFormulario = (tipo: "Natural" | "Juridica") => {
    resetForm(tipo);
    resetValidation();
    setIdentificacionValidada(false);
    setError(null);
  };

  // Formateo automático y validación de fecha tipo DD/MM/AAAA
  const manejarCambioFecha = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 8) cleanValue = cleanValue.slice(0, 8);

    let dia = cleanValue.slice(0, 2);
    let mes = cleanValue.slice(2, 4);
    let anio = cleanValue.slice(4, 8);

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

    updateField(name as any, nuevaFecha);
    setError(null);
  };

  const consultarIdentificacion = async () => {
    const numero = form.tipo_persona === "Natural" ? form.cedula : form.ruc;
    if (
      !numero ||
      numero.length < (form.tipo_persona === "Natural" ? 10 : 13)
    ) {
      setError("Ingrese un documento válido.");
      return;
    }

    setError(null);

    if (form.tipo_persona === "Natural") {
      const resultado = await consultarCedula(numero);
      if (resultado) {
        updateMultipleFields({
          nombre: resultado.nombre || '',
          cedula: resultado.cedula || numero,
        });
        lockName(true);
        setIdentificacionValidada(false);
      } else {
        lockName(false);
        setIdentificacionValidada(false);
      }
    } else {
      const resultado = await consultarRuc(numero);
      if (resultado) {
        updateMultipleFields({
          nombre: resultado.nombre || '',
          direccion: resultado.direccion || '',
          representante: resultado.representante || '',
        });
        lockName(true);
        setIdentificacionValidada(false);
      } else {
        lockName(false);
        setIdentificacionValidada(false);
      }
    }
  };

  // Valida para natural: coincide con alguna de las fechas válidas
  const validarFechaNatural = () => {
    if (!fechasValidasNatural.length || !form.fechaEmisionIngresada)
      return false;
    const normalizar = (fecha: string) => fecha.replace(/[-/]/g, "").trim().toLowerCase();
    return fechasValidasNatural.some(
      (f) => normalizar(form.fechaEmisionIngresada) === normalizar(f)
    );
  };

  // Valida para jurídica: coincide con alguna de las fechas válidas del representante
  const validarFechaJuridica = () => {
    if (!fechasValidasJuridica.length || !form.fechaExpRepreIngresada)
      return false;
    const normalizar = (fecha: string) => fecha.replace(/[-/]/g, "").trim().toLowerCase();
    return fechasValidasJuridica.some(
      (f) => normalizar(form.fechaExpRepreIngresada) === normalizar(f)
    );
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.tipo_persona === "Natural" && !form.cedula) {
      setError("La cédula es obligatoria.");
      return;
    }
    if (form.tipo_persona === "Juridica" && !form.ruc) {
      setError("El RUC es obligatorio.");
      return;
    }

    // Validar formato de cédula o RUC
    if (form.tipo_persona === "Natural") {
      if (!validarCedulaEcuatoriana(form.cedula)) {
        setError("El formato de la cédula no es válido. Por favor, verifica que sea una cédula ecuatoriana correcta.");
        return;
      }
    }
    if (form.tipo_persona === "Juridica") {
      if (!validarRucEcuatoriano(form.ruc)) {
        setError("El formato del RUC no es válido. Por favor, verifica que sea un RUC ecuatoriano correcto.");
        return;
      }
    }

    if (!form.telefono || !validateTelefono(form.telefono)) {
      setError("El número de teléfono es obligatorio y debe tener 10 dígitos.");
      return;
    }

    // Validación natural usando ambas fechas posibles
    if (form.tipo_persona === "Natural" && fechasValidasNatural.length) {
      if (!form.fechaEmisionIngresada) {
        setError(
          "Debes ingresar la fecha de emisión o expiración de tu cédula."
        );
        return;
      }
      if (!validarFechaNatural()) {
        setError(
          "La fecha de emisión o expiración no coincide con la registrada."
        );
        return;
      }
    }
    // Validación jurídica usando ambas fechas posibles
    if (form.tipo_persona === "Juridica" && fechasValidasJuridica.length) {
      if (!form.fechaExpRepreIngresada) {
        setError(
          "Debes ingresar la fecha de emisión o expiración de la cédula del representante legal."
        );
        return;
      }
      if (!validarFechaJuridica()) {
        setError(
          "La fecha de emisión o expiración del representante legal no coincide con la registrada."
        );
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
    if (form.tipo_persona === "Natural") {
      const isDuplicate = await checkDuplicateIdentification('Natural', form.cedula, userId);
      if (isDuplicate) return;
    }
    if (form.tipo_persona === "Juridica") {
      const isDuplicate = await checkDuplicateIdentification('Juridica', form.ruc, userId);
      if (isDuplicate) return;
    }

    const success = await saveProfile(userId, {
      tipo_persona: form.tipo_persona,
      cedula: form.cedula || null,
      ruc: form.ruc || null,
      nombre: form.nombre,
      direccion: form.direccion,
      telefono: form.telefono,
      representante: form.representante || null,
    });

    if (success) {
      router.push("/auth/iniciar-sesion"); // Redirigir a iniciar sesión
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
                ${
                  form.tipo_persona === "Natural"
                    ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                    : "bg-white text-blue-900 border-blue-200 hover:bg-blue-50"
                }
              `}
              onClick={() => limpiarFormulario("Natural")}
            >
              Natural
              <span className="block text-xs font-normal mt-1">Cédula</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center justify-center px-0 py-4 rounded-xl border-2 transition-all font-medium
                ${
                  form.tipo_persona === "Juridica"
                    ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                    : "bg-white text-blue-900 border-blue-200 hover:bg-blue-50"
                }
              `}
              onClick={() => limpiarFormulario("Juridica")}
            >
              Jurídica
              <span className="block text-xs font-normal mt-1">RUC</span>
            </button>
          </div>
        </div>

        {/* Documento de identidad */}
        <div>
          <label
            htmlFor={form.tipo_persona === "Natural" ? "cedula" : "ruc"}
            className="font-semibold text-gray-700 block mb-1"
          >
            {form.tipo_persona === "Natural" ? "Cédula" : "RUC"}{" "}
            <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name={form.tipo_persona === "Natural" ? "cedula" : "ruc"}
              id={form.tipo_persona === "Natural" ? "cedula" : "ruc"}
              type="text"
              maxLength={form.tipo_persona === "Natural" ? 10 : 13}
              placeholder={form.tipo_persona === "Natural" ? "Cédula" : "RUC"}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              value={form.tipo_persona === "Natural" ? form.cedula : form.ruc}
              onChange={handleChange}
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
            <div
              className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                validacionDocumento.mensaje.includes(
                  "Por favor, ingresa la fecha de emisión o expiración"
                )
                  ? "text-blue-700 bg-blue-100"
                  : validacionDocumento.esValido
                  ? "text-green-700 bg-green-100"
                  : "text-red-600 bg-red-100"
              }`}
            >
              {validacionDocumento.mensaje}
            </div>
          )}
        </div>

        {/* FECHA DE EMISIÓN / EXPIRACIÓN - NATURAL */}

        {/* FECHA DE EMISIÓN / EXPIRACIÓN REPRESENTANTE LEGAL - JURÍDICA SOLO DESPUÉS DE CONSULTA */}

        <div>
          <label
            htmlFor="nombre"
            className="font-semibold text-gray-700 block mb-1"
          >
            {form.tipo_persona === "Natural" ? "Nombre" : "Razón Social"}{" "}
            <span className="text-red-600">*</span>
          </label>
          <textarea
            name="nombre"
            id="nombre"
            placeholder={
              form.tipo_persona === "Natural" ? "Nombre" : "Razón Social"
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            value={form.nombre}
            onChange={handleChange}
            disabled={nombreBloqueado}
            rows={2}
          />
        </div>

        {/* CAMPO REPRESENTANTE LEGAL */}
        {form.tipo_persona === "Juridica" && (
          <div>
            <label
              htmlFor="representante"
              className="font-semibold text-gray-700 block mb-1"
            >
              Nombre del Representante Legal{" "}
              <span className="text-red-600">*</span>
            </label>
            <input
              name="representante"
              id="representante"
              type="text"
              placeholder="Representante Legal"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
              value={form.representante}
              onChange={handleChange}
              disabled={nombreBloqueado}
            />
          </div>
        )}

        <div>
          <label
            htmlFor="direccion"
            className="font-semibold text-gray-700 block mb-1"
          >
            Dirección <span className="text-red-600">*</span>
          </label>
          <input
            name="direccion"
            id="direccion"
            type="text"
            placeholder="Dirección"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.direccion}
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="telefono"
            className="font-semibold text-gray-700 block mb-1"
          >
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
            onChange={handleChange}
            inputMode="numeric"
            autoComplete="off"
          />
        </div>
        {form.tipo_persona === "Natural" && fechasValidasNatural.length > 0 && (
          <div>
            <label
              htmlFor="fechaEmisionIngresada"
              className="font-semibold text-gray-700 block mb-1"
            >
              Fecha de emisión o expiración de la cédula{" "}
              <span className="text-red-600">*</span>
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
              Puedes ingresar la fecha de emisión <b>o</b> expiración de tu
              cédula.
            </div>
            {form.fechaEmisionIngresada && !validarFechaNatural() && (
              <div className="text-sm text-red-600 mt-1">
                La fecha ingresada no coincide con los registros oficiales.
              </div>
            )}
            {form.fechaEmisionIngresada && validarFechaNatural() && (
              <div className="text-sm text-green-700 mt-1">
                Fecha verificada correctamente.
              </div>
            )}
          </div>
        )}

        {form.tipo_persona === "Juridica" &&
          nombreBloqueado &&
          fechasValidasJuridica.length > 0 && (
            <div>
              <label
                htmlFor="fechaExpRepreIngresada"
                className="font-semibold text-gray-700 block mb-1"
              >
                Fecha de emisión o expiración de la cédula del representante
                legal <span className="text-red-600">*</span>
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
                Puedes ingresar la fecha de emisión <b>o</b> expiración de la
                cédula del representante legal.
                {fechasValidasJuridica.length === 0 && (
                  <span className="block text-red-500 mt-1">
                    (No se pudo obtener la fecha oficial, se guardará tu dato
                    pero no se validará)
                  </span>
                )}
              </div>
              {form.fechaExpRepreIngresada &&
                fechasValidasJuridica.length > 0 &&
                !validarFechaJuridica() && (
                  <div className="text-sm text-red-600 mt-1">
                    La fecha ingresada no coincide con los registros oficiales.
                  </div>
                )}
              {form.fechaExpRepreIngresada &&
                fechasValidasJuridica.length > 0 &&
                validarFechaJuridica() && (
                  <div className="text-sm text-green-700 mt-1">
                    Fecha verificada correctamente.
                  </div>
                )}
            </div>
          )}

        {error && (
          <div className="text-center text-red-700 bg-red-100 py-2 px-3 rounded-lg">
            {error}
          </div>
        )}
        {exito && (
          <div className="text-center text-green-700 bg-green-100 py-2 px-3 rounded-lg">
            {exito}
          </div>
        )}

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
