export interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
}

export interface Unidad {
  id: number;
  nombre: string;
  simbolo: string;
}

export interface NuevoProducto {
  nombre: string;
  categoria: string;
}

export interface ImpactoCalculado {
  personasAlimentadas: number;
  comidaEquivalente: string;
}

export interface HorarioDisponible {
  value: string;
  label: string;
}

export interface ProductoSeleccionado {
  nombre: string;
  categoria: string;
}
