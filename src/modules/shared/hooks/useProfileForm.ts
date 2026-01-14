import { useState, useCallback } from 'react';

interface ProfileFormData {
  tipo_persona: 'Natural' | 'Juridica';
  cedula: string;
  ruc: string;
  nombre: string;
  direccion: string;
  telefono: string;
  fechaEmisionIngresada: string;
  fechaExpRepreIngresada: string;
  representante: string;
  latitud: number | null;
  longitud: number | null;
}

const initialFormState: ProfileFormData = {
  tipo_persona: 'Natural',
  cedula: '',
  ruc: '',
  nombre: '',
  direccion: '',
  telefono: '',
  fechaEmisionIngresada: '',
  fechaExpRepreIngresada: '',
  representante: '',
  latitud: null,
  longitud: null,
};

export function useProfileForm() {
  const [form, setForm] = useState<ProfileFormData>(initialFormState);
  const [nombreBloqueado, setNombreBloqueado] = useState(false);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateField = useCallback((field: keyof ProfileFormData, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateMultipleFields = useCallback((fields: Partial<ProfileFormData>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  }, []);

  const updateLocation = useCallback((data: { address: string; latitude: number; longitude: number }) => {
    setForm((prev) => ({
      ...prev,
      direccion: data.address,
      latitud: data.latitude,
      longitud: data.longitude,
    }));
  }, []);

  const resetForm = useCallback((tipo?: 'Natural' | 'Juridica') => {
    setForm({
      ...initialFormState,
      tipo_persona: tipo || 'Natural',
    });
    setNombreBloqueado(false);
  }, []);

  const lockName = useCallback((shouldLock: boolean) => {
    setNombreBloqueado(shouldLock);
  }, []);

  const validateTelefono = useCallback((telefono: string): boolean => {
    const soloNumeros = telefono.replace(/\D/g, '');
    return soloNumeros.length === 10 && /^[0-9]+$/.test(soloNumeros);
  }, []);

  return {
    form,
    nombreBloqueado,
    handleChange,
    updateField,
    updateMultipleFields,
    updateLocation,
    resetForm,
    lockName,
    validateTelefono,
  };
}
