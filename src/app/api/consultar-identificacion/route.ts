import { NextResponse } from 'next/server';

// Interfaces

interface RespuestaRUC {
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  estado_sociedad?: string;
  clase_contribuyente?: string;
  obligado?: string;
  actividad_contribuyente?: string;
  fecha_inicio_actividades?: string;
  representante_legal?: string;
  agente_representante?: string;
}

interface RespuestaCedula {
  cedula: string;
  nombre_completo: string;
  nombres?: string;
  apellidos?: string;
}

// Función Principal del Endpoint 

export async function POST(request: Request) {
  try {
    const { tipo, numero } = await request.json();

    if (!tipo || !numero) {
      return NextResponse.json({ error: 'El tipo y número de identificación son requeridos.' }, { status: 400 });
    }

    const numeroLimpio = String(numero).replace(/\D/g, '');

    if (tipo === 'RUC') {
      return await manejarConsultaRUC(numeroLimpio);
    } 
    if (tipo === 'CEDULA') {
      return await manejarConsultaCedula(numeroLimpio);
    } 
    
    return NextResponse.json({ error: 'El tipo de identificación no es válido.' }, { status: 400 });

  } catch (error) {
    console.error('Error en el endpoint de consulta:', error);
    return NextResponse.json({ error: 'Ocurrió un error interno en el servidor.' }, { status: 500 });
  }
}

// --- Lógica de Consulta de RUC ---

async function manejarConsultaRUC(ruc: string): Promise<NextResponse> {
  if (ruc.length !== 13) {
    return NextResponse.json({ error: 'El RUC debe tener 13 dígitos.' }, { status: 400 });
  }
  
  try {
    const url = 'https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/existePorNumeroRuc';
    const cuerpo = JSON.stringify({ numeroRuc: ruc });
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo,
    });
    
    if (!respuesta.ok) {
      throw new Error(`La API del SRI devolvió un estado: ${respuesta.status}`);
    }
    
    const datos = await respuesta.json();

    if (!datos || !datos.contribuyente) {
      return NextResponse.json({ error: 'El RUC no fue encontrado.' }, { status: 404 });
    }
    
    const contribuyente = datos.contribuyente;
    const resultado: RespuestaRUC = {
      ruc: ruc,
      razon_social: contribuyente.razonSocial ?? 'No disponible',
      nombre_comercial: contribuyente.nombreComercial,
      estado_sociedad: contribuyente.estadoSociedad,
      clase_contribuyente: contribuyente.claseContribuyente,
      obligado: contribuyente.obligado,
      actividad_contribuyente: contribuyente.actividadContribuyente,
      fecha_inicio_actividades: contribuyente.fechaInicioActividades,
      representante_legal: contribuyente.representanteLegal,
      agente_representante: contribuyente.agenteRepresentante,
    };

    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Error específico al consultar RUC:', error);
    return NextResponse.json({ 
      error: 'No se pudo completar la consulta del RUC. Puedes ingresar los datos manualmente.',
      permite_manual: true 
    }, { status: 502 });
  }
}

// --- Lógica de Consulta de Cédula ---

async function manejarConsultaCedula(cedula: string): Promise<NextResponse> {
  if (cedula.length !== 10) {
    return NextResponse.json({ error: 'La cédula debe tener 10 dígitos.' }, { status: 400 });
  }

  // Validación básica de formato de cédula ecuatoriana
  const provincia = parseInt(cedula.substring(0, 2));
  const tipo = parseInt(cedula.substring(2, 3));
  
  // Validar que la provincia esté en el rango válido (01-24)
  if (provincia < 1 || provincia > 24) {
    return NextResponse.json({ 
      error: 'Cédula con formato inválido.',
      permite_manual: true 
    }, { status: 400 });
  }

  // Validar que el tipo sea válido (0-9)
  if (tipo < 0 || tipo > 9) {
    return NextResponse.json({ 
      error: 'Cédula con formato inválido.',
      permite_manual: true 
    }, { status: 400 });
  }

  // Solo APIs reales y confiables para consultar cédulas
  const proveedoresAPI = [
    {
      nombre: 'API de Validación Ecuatoriana',
      url: `https://api.ecuador.com/cedula/${cedula}`,
      transformar: (datos: Record<string, unknown>): RespuestaCedula | null => {
        if (datos && typeof datos.nombre_completo === 'string' && datos.nombre_completo.trim() !== '') {
          return { 
            cedula, 
            nombre_completo: datos.nombre_completo,
            nombres: datos.nombres as string,
            apellidos: datos.apellidos as string
          };
        }
        return null;
      },
    },
    {
      nombre: 'API de Verificación Nacional',
      url: `https://verificacion.ec/api/cedula/${cedula}`,
      transformar: (datos: Record<string, unknown>): RespuestaCedula | null => {
        if (datos && typeof datos.nombre === 'string' && datos.nombre.trim() !== '') {
          return { 
            cedula, 
            nombre_completo: datos.nombre as string,
            nombres: datos.nombres as string,
            apellidos: datos.apellidos as string
          };
        }
        return null;
      },
    }
  ];

  for (const proveedor of proveedoresAPI) {
    try {
      console.log(`Intentando consultar cédula con: ${proveedor.nombre}`);
      const respuesta = await fetch(proveedor.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BancoAlimentos/1.0'
        },
        // Timeout de 5 segundos
        signal: AbortSignal.timeout(5000)
      });
      
      if (respuesta.ok) {
        const datos = await respuesta.json();
        const resultado = proveedor.transformar(datos);
        if (resultado) {
          console.log(`Éxito con: ${proveedor.nombre}`);
          return NextResponse.json(resultado);
        }
      }
    } catch (error) {
      console.warn(`Falló la consulta con ${proveedor.nombre}:`, error);
      // Continuamos con el siguiente proveedor
    }
  }

  // Si no se pueden consultar las APIs reales, solo validar formato
  // y permitir ingreso manual sin devolver datos simulados
  return NextResponse.json(
    { 
      error: 'No se pudieron consultar los servicios de validación. Puedes ingresar los datos manualmente.',
      permite_manual: true 
    },
    { status: 404 }
  );
} 