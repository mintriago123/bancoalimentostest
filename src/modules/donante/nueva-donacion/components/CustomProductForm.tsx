interface CustomProductFormProps {
  nombre: string;
  categoria: string;
  categoriasDisponibles: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function CustomProductForm({
  nombre,
  categoria,
  categoriasDisponibles,
  onChange,
}: CustomProductFormProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="font-medium text-gray-800 mb-3">Producto Personalizado</h4>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
          <input
            type="text"
            name="nombre"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={nombre}
            onChange={onChange}
            placeholder="Ej: Pan integral casero"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select
            name="categoria"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={categoria}
            onChange={onChange}
          >
            <option value="">Selecciona una categoría</option>
            {categoriasDisponibles.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>
    </div>
  );
}
