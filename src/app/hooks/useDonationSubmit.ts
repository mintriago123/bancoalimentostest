import { useState } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
}

interface Unidad {
  id: number;
  nombre: string;
  simbolo: string;
}

interface UserProfile {
  id: string;
  rol: string;
  tipo_persona: 'Natural' | 'Juridica';
  nombre: string;
  ruc?: string;
  cedula?: string;
  direccion: string;
  telefono: string;
  representante?: string;
  email?: string;
}

interface FormularioDonacion {
  tipo_producto: string;
  producto_personalizado_nombre: string;
  cantidad: string;
  unidad_id: string;
  fecha_vencimiento: string;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido: string;
  observaciones: string;
}

interface ImpactoEstimado {
  personasAlimentadas: number;
  comidaEquivalente: string;
}

interface UseDonationSubmitReturn {
  enviando: boolean;
  mensaje: string | null;
  enviarDonacion: (
    formulario: FormularioDonacion,
    nuevoProducto: { nombre: string; categoria: string },
    impacto: ImpactoEstimado,
    productoInfo: { nombre: string; categoria: string } | null,
    unidadInfo: Unidad | null,
    alimentos: Alimento[]
  ) => Promise<boolean>;
  limpiarMensaje: () => void;
}

export function useDonationSubmit(
  supabase: SupabaseClient | null,
  currentUser: User | null | undefined,
  userProfile: UserProfile | null
): UseDonationSubmitReturn {
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const enviarDonacion = async (
    formulario: FormularioDonacion,
    nuevoProducto: { nombre: string; categoria: string },
    impacto: ImpactoEstimado,
    productoInfo: { nombre: string; categoria: string } | null,
    unidadInfo: Unidad | null,
    alimentos: Alimento[]
  ): Promise<boolean> => {
    if (!supabase) {
      setMensaje('Error: No hay conexión con la base de datos');
      return false;
    }

    setEnviando(true);
    setMensaje(null);

    try {
      const datosInsercion: any = {
        nombre_donante: userProfile?.nombre || 'Usuario Anónimo',
        telefono: userProfile?.telefono || '',
        email: currentUser?.email || '',
        cantidad: Number(formulario.cantidad),
        fecha_vencimiento: formulario.fecha_vencimiento || null,
        fecha_disponible: formulario.fecha_disponible,
        direccion_entrega: formulario.direccion_entrega,
        horario_preferido: formulario.horario_preferido || null,
        observaciones: formulario.observaciones || null,
        impacto_estimado_personas: impacto.personasAlimentadas,
        impacto_equivalente: impacto.comidaEquivalente,
        creado_en: new Date().toISOString(),
        unidad_id: Number(formulario.unidad_id),
        unidad_nombre: unidadInfo?.nombre,
        unidad_simbolo: unidadInfo?.simbolo,
        user_id: currentUser?.id || null,
        ruc_donante: userProfile?.ruc || null,
        cedula_donante: userProfile?.cedula || null,
        direccion_donante_completa: userProfile?.direccion || null,
        representante_donante: userProfile?.representante || null,
        tipo_persona_donante: userProfile?.tipo_persona || null,
      };

      if (formulario.tipo_producto !== 'personalizado') {
        const alimento = alimentos.find(a => a.id.toString() === formulario.tipo_producto);
        Object.assign(datosInsercion, {
          alimento_id: Number(formulario.tipo_producto),
          tipo_producto: alimento?.nombre,
          categoria_comida: alimento?.categoria,
          es_producto_personalizado: false
        });
      } else {
        Object.assign(datosInsercion, {
          alimento_id: null,
          tipo_producto: formulario.producto_personalizado_nombre,
          categoria_comida: nuevoProducto.categoria,
          es_producto_personalizado: true
        });
      }

      const { error } = await supabase.from('donaciones').insert([datosInsercion]);

      if (error) {
        throw error;
      }

      setMensaje('¡Donación registrada exitosamente! Te contactaremos pronto. Gracias por tu contribución.');
      return true;
    } catch (err: any) {
      setMensaje(err.message || 'Error al registrar la donación. Inténtalo nuevamente.');
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const limpiarMensaje = () => {
    setMensaje(null);
  };

  return {
    enviando,
    mensaje,
    enviarDonacion,
    limpiarMensaje,
  };
}
