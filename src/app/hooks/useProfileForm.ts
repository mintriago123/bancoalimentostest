import { useState } from 'react';

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
};

export function useProfileForm() {
  const [form, setForm] = useState<ProfileFormData>(initialFormState);
  const [nombreBloqueado, setNombreBloqueado] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateField = (field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateMultipleFields = (fields: Partial<ProfileFormData>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  };

  const resetForm = (tipo?: 'Natural' | 'Juridica') => {
    setForm({
      ...initialFormState,
      tipo_persona: tipo || 'Natural',
    });
    setNombreBloqueado(false);
  };

  const lockName = (shouldLock: boolean) => {
    setNombreBloqueado(shouldLock);
  };

  const validateTelefono = (telefono: string): boolean => {
    const soloNumeros = telefono.replace(/\D/g, '');
    return soloNumeros.length === 10 && /^[0-9]+$/.test(soloNumeros);
  };

  return {
    form,
    nombreBloqueado,
    handleChange,
    updateField,
    updateMultipleFields,
    resetForm,
    lockName,
    validateTelefono,
  };
}
