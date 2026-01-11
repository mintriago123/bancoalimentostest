import { useState } from 'react';
import { validarCedulaEcuatoriana, validarRucEcuatoriano } from '@/lib/validaciones';

interface ValidationResult {
  esValido: boolean;
  mensaje: string | null;
}

interface IdentityData {
  nombre?: string;
  cedula?: string;
  direccion?: string;
  representante?: string;
  fechasValidas: string[];
}

export function useIdentityValidation() {
  const [consultando, setConsultando] = useState(false);
  const [validacionDocumento, setValidacionDocumento] = useState<ValidationResult>({
    esValido: false,
    mensaje: null,
  });
  const [fechasValidasNatural, setFechasValidasNatural] = useState<string[]>([]);
  const [fechasValidasJuridica, setFechasValidasJuridica] = useState<string[]>([]);

  // Extrae datos demográficos para persona natural
  const extraerDatosDemograficos = (apiResponse: any) => {
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
  };

  // Extrae datos para persona jurídica
  const extraerDatosRuc = (respuesta: any) => {
    const s5383 = respuesta?.['Servicio 5383'];
    const s5387 = respuesta?.['Servicio 5387'];
    const datosRepre = s5387?.['Datos Representante Legal'];
    return {
      razonSocial: s5383?.['Razon Social'] || '',
      direccion: s5383?.['Descripcion Ubicacion Geo'] || '',
      representante: s5387?.['Nombre Repre Legal'] || '',
      cedulaRepresentante: datosRepre?.['Cedula'] || '',
      fechaExpedicionRepresentante: datosRepre?.['Fecha Expedicion'] || '',
      fechaExpiracionRepresentante: datosRepre?.['Fecha Expiracion'] || '',
    };
  };

  const consultarCedula = async (cedula: string): Promise<IdentityData | null> => {
    if (!validarCedulaEcuatoriana(cedula)) {
      setValidacionDocumento({
        esValido: false,
        mensaje: 'La cédula ingresada no es válida.',
      });
      return null;
    }

    setConsultando(true);
    try {
      // Usar endpoint proxy local para evitar problemas de Mixed Content
      const url = `/api/proxy/consultar-cedula?identificacion=${cedula}`;
      const respuesta = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const datos = await respuesta.json();
      const datosDemograficos = extraerDatosDemograficos(datos);

      const fechasValidas = [
        datosDemograficos.fechaExpedicion,
        datosDemograficos.fechaExpiracion,
      ].filter(Boolean);

      setFechasValidasNatural(fechasValidas);

      if (respuesta.ok && datosDemograficos?.nombre) {
        setValidacionDocumento({
          esValido: false,
          mensaje: 'Por favor, ingresa la fecha de emisión o expiración de tu cédula para continuar.',
        });
        return {
          nombre: datosDemograficos.nombre,
          cedula: datosDemograficos.cedula || cedula,
          fechasValidas,
        };
      } else {
        setValidacionDocumento({
          esValido: false,
          mensaje: 'Puedes ingresar los datos manualmente.',
        });
        setFechasValidasNatural([]);
        return null;
      }
    } catch {
      setValidacionDocumento({
        esValido: false,
        mensaje: 'No se pudo consultar la identificación.',
      });
      setFechasValidasNatural([]);
      return null;
    } finally {
      setConsultando(false);
    }
  };

  const consultarRuc = async (ruc: string): Promise<IdentityData | null> => {
    if (!validarRucEcuatoriano(ruc)) {
      setValidacionDocumento({
        esValido: false,
        mensaje: 'El RUC ingresado no es válido.',
      });
      return null;
    }

    setConsultando(true);
    try {
      // Usar endpoint proxy local para evitar problemas de Mixed Content
      const url = `/api/proxy/consultar-ruc?ruc=${ruc}`;
      const respuesta = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const datos = await respuesta.json();
      const datosRuc = extraerDatosRuc(datos);

      const fechasValidas = [
        datosRuc.fechaExpedicionRepresentante,
        datosRuc.fechaExpiracionRepresentante,
      ].filter(Boolean);

      setFechasValidasJuridica(fechasValidas);

      if (respuesta.ok && datosRuc.razonSocial) {
        setValidacionDocumento({
          esValido: false,
          mensaje: 'Por favor, ingresa la fecha de emisión o expiración de la cédula del representante legal para continuar.',
        });
        return {
          nombre: datosRuc.razonSocial,
          direccion: datosRuc.direccion,
          representante: datosRuc.representante,
          fechasValidas,
        };
      } else {
        setValidacionDocumento({
          esValido: false,
          mensaje: 'Puedes ingresar los datos manualmente.',
        });
        setFechasValidasJuridica([]);
        return null;
      }
    } catch {
      setValidacionDocumento({
        esValido: false,
        mensaje: 'No se pudo consultar la identificación.',
      });
      setFechasValidasJuridica([]);
      return null;
    } finally {
      setConsultando(false);
    }
  };

  const resetValidation = () => {
    setValidacionDocumento({ esValido: false, mensaje: null });
    setFechasValidasNatural([]);
    setFechasValidasJuridica([]);
  };

  return {
    consultando,
    validacionDocumento,
    fechasValidasNatural,
    fechasValidasJuridica,
    consultarCedula,
    consultarRuc,
    resetValidation,
  };
}
