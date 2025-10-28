export interface UserProfile {
  id: string;
  email?: string;
  nombre: string;
  cedula?: string;
  telefono: string;
  direccion: string;
  tipo_persona: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilFormData {
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface MessageState {
  type: 'success' | 'error';
  text: string;
}
