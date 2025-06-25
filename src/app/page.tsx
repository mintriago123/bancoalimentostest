import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-4xl font-bold">Próximamente</h1>
      <p className="text-lg text-gray-600">
        El contenido de esta página estará disponible próximamente.
      </p>
      <div className="flex space-x-4 mt-4">
        <Link href="/auth/iniciar-sesion">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Iniciar sesión
          </button>
        </Link>
        <Link href="/auth/registrar">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Registrarse
          </button>
        </Link>
      </div>
    </div>
  );
}