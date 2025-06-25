import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400">
      <div className="space-y-6 max-w-md w-full mx-auto">
        <h1 className="text-4xl font-bold text-center">Próximamente</h1>
        <p className="text-lg text-gray-600 text-center">
          El contenido de esta página estará disponible próximamente.
        </p>
        <div className="flex space-x-4 justify-center mt-4">
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
    </div>
  );
}