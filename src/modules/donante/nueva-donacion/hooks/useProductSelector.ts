import { useState, useCallback, useEffect } from 'react';

interface Alimento {
  id: number;
  nombre: string;
  categoria: string;
}

interface UseProductSelectorReturn {
  busquedaAlimento: string;
  alimentosFiltrados: Alimento[];
  mostrarDropdown: boolean;
  alimentoSeleccionado: Alimento | null;
  filtroCategoria: string;
  mostrarFormularioNuevoProducto: boolean;
  nuevoProducto: { nombre: string; categoria: string };
  setBusquedaAlimento: (value: string) => void;
  setMostrarDropdown: (value: boolean) => void;
  setFiltroCategoria: (value: string) => void;
  manejarBusquedaAlimento: (e: React.ChangeEvent<HTMLInputElement>) => void;
  manejarFocusInput: () => void;
  manejarSeleccionProducto: (alimento: Alimento) => void;
  manejarSeleccionPersonalizado: () => void;
  limpiarSeleccion: () => void;
  manejarCambioCategoria: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  manejarBlurContainer: (e: React.FocusEvent) => void;
  manejarCambioNuevoProducto: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  filtrarAlimentos: (termino: string, categoria?: string) => void;
}

export function useProductSelector(
  alimentos: Alimento[],
  onProductoChange: (id: string, nombrePersonalizado?: string) => void,
  onMensajeCambio: (mensaje: string | null) => void
): UseProductSelectorReturn {
  const [busquedaAlimento, setBusquedaAlimento] = useState('');
  const [alimentosFiltrados, setAlimentosFiltrados] = useState<Alimento[]>([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState<Alimento | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [mostrarFormularioNuevoProducto, setMostrarFormularioNuevoProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    categoria: ''
  });

  // Función para filtrar alimentos basado en la búsqueda y categoría
  const filtrarAlimentos = useCallback((termino: string, categoria: string = '') => {
    let filtrados = alimentos;

    if (termino.trim()) {
      const terminoLower = termino.toLowerCase();
      filtrados = filtrados.filter(alimento =>
        alimento.nombre.toLowerCase().includes(terminoLower) ||
        alimento.categoria.toLowerCase().includes(terminoLower)
      );
    }

    if (categoria) {
      filtrados = filtrados.filter(alimento => alimento.categoria.toLowerCase() === categoria.toLowerCase());
    }

    setAlimentosFiltrados(filtrados);
  }, [alimentos]);

  // Filtrar alimentos cuando cambia la búsqueda o se cargan los alimentos
  useEffect(() => {
    filtrarAlimentos(busquedaAlimento, filtroCategoria);
  }, [alimentos, busquedaAlimento, filtrarAlimentos, filtroCategoria]);

  // Manejar cambio en el buscador
  const manejarBusquedaAlimento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setBusquedaAlimento(valor);
    
    if (alimentoSeleccionado && valor !== `${alimentoSeleccionado.nombre} (${alimentoSeleccionado.categoria})`) {
      setAlimentoSeleccionado(null);
      onProductoChange('');
      setMostrarFormularioNuevoProducto(false);
    }
    
    filtrarAlimentos(valor, filtroCategoria);
    setMostrarDropdown(true);
  };

  const manejarFocusInput = () => {
    if (!alimentoSeleccionado) {
      setMostrarDropdown(true);
    }
  };

  // Manejar selección de producto del dropdown
  const manejarSeleccionProducto = (alimento: Alimento) => {
    onProductoChange(alimento.id.toString());
    setAlimentoSeleccionado(alimento);
    setBusquedaAlimento(`${alimento.nombre} (${alimento.categoria})`);
    setMostrarDropdown(false);
    setMostrarFormularioNuevoProducto(false);
    onMensajeCambio(null);
  };

  const manejarSeleccionPersonalizado = () => {
    onProductoChange('personalizado');
    setAlimentoSeleccionado(null);
    setBusquedaAlimento('Producto personalizado');
    setMostrarDropdown(false);
    setMostrarFormularioNuevoProducto(true);
    onMensajeCambio(null);
  };

  const limpiarSeleccion = () => {
    setAlimentoSeleccionado(null);
    setBusquedaAlimento('');
    onProductoChange('');
    setMostrarFormularioNuevoProducto(false);
    setMostrarDropdown(true);
  };
  
  // Manejar cambio de categoría
  const manejarCambioCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoria = e.target.value;
    setFiltroCategoria(categoria);

    if (alimentoSeleccionado) {
      setAlimentoSeleccionado(null);
      setBusquedaAlimento('');
      onProductoChange('');
    }

    filtrarAlimentos('', categoria);
    setMostrarDropdown(false);
  };
  
  const manejarBlurContainer = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setTimeout(() => {
        setMostrarDropdown(false);
      }, 150);
    }
  };

  const manejarCambioNuevoProducto = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({ ...prev, [name]: value }));

    if (name === 'nombre') {
      onProductoChange('personalizado', value);
    }
  };

  return {
    busquedaAlimento,
    alimentosFiltrados,
    mostrarDropdown,
    alimentoSeleccionado,
    filtroCategoria,
    mostrarFormularioNuevoProducto,
    nuevoProducto,
    setBusquedaAlimento,
    setMostrarDropdown,
    setFiltroCategoria,
    manejarBusquedaAlimento,
    manejarFocusInput,
    manejarSeleccionProducto,
    manejarSeleccionPersonalizado,
    limpiarSeleccion,
    manejarCambioCategoria,
    manejarBlurContainer,
    manejarCambioNuevoProducto,
    filtrarAlimentos,
  };
}
