import Link from "next/link";
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Banco de Alimentos Solidarios</title>
        <meta name="description" content="Luchamos contra el hambre y el desperdicio de alimentos. Regístrate o inicia sesión para participar." />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* Barra de navegación simplificada */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-green-600">Banco de Alimentos</span>
              </div>
              <div className="hidden md:flex space-x-8">
                {/* Espacio vacío donde antes estaban los enlaces */}
              </div>
              <div className="flex items-center space-x-4">
                {/* Botones eliminados según solicitud */}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nutriendo vidas, <br className="hidden md:block" />
              <span className="text-green-600">Optimizando recursos</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Recolectamos alimentos que serán distribuidos entre quienes más lo necesitan.
              Únete a nuestra misión y sé parte de este gran cambio.
            </p>
           <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/registrar?rol=DONANTE">
                <button className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-md w-full sm:w-auto flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Registrarse
                </button>
              </Link>
              <Link href="/auth/iniciar-sesion">
                <button className="px-8 py-3 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition w-full sm:w-auto flex items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Iniciar sesión
                </button>
              </Link>
            </div>
          </div>
        </main>

        {/* Estadísticas impactantes */}
        <section className="py-12 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <p className="text-4xl font-bold mb-2">1.3B</p>
                <p className="text-lg">Toneladas de alimentos se desperdician anualmente</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold mb-2">800M</p>
                <p className="text-lg">Personas pasan hambre en el mundo</p>
              </div>
              <div className="p-6">
                <p className="text-4xl font-bold mb-2">10K+</p>
                <p className="text-lg">Familias ayudadas mensualmente</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">¿Cómo funciona nuestro banco de alimentos?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg hover:shadow-md transition">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recolección</h3>
                <p className="text-gray-600">Recogemos alimentos excedentes de supermercados, restaurantes y productores.</p>
              </div>
              <div className="text-center p-6 rounded-lg hover:shadow-md transition">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Clasificación</h3>
                <p className="text-gray-600">Nuestros voluntarios clasifican y almacenan los alimentos adecuadamente.</p>
              </div>
              <div className="text-center p-6 rounded-lg hover:shadow-md transition">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Distribución</h3>
                <p className="text-gray-600">Entregamos los alimentos a organizaciones y familias necesitadas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Historias que nos inspiran</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 italic mb-4">"Gracias al banco de alimentos, mis hijos pueden tener tres comidas al día. Esta ayuda ha cambiado nuestras vidas."</p>
                <p className="font-medium text-green-600">- María G., madre soltera</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-gray-600 italic mb-4">"Como voluntario, he visto el impacto real de nuestro trabajo. Cada kilo de alimento rescatado hace la diferencia."</p>
                <p className="font-medium text-green-600">- Javier R., voluntario</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Banco de Alimentos</h3>
                <p className="text-gray-300">Luchando contra el hambre y el desperdicio de alimentos desde 2010.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Participa</h3>
                <ul className="space-y-2">
                  <li><Link href="/donar" className="text-gray-300 hover:text-white transition">Donar alimentos</Link></li>
                  <li><Link href="/voluntariado" className="text-gray-300 hover:text-white transition">Ser voluntario</Link></li>
                  <li><Link href="/empresas" className="text-gray-300 hover:text-white transition">Para empresas</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Contacto</h3>
                <ul className="space-y-2">
                  <li className="text-gray-300">info@bancodealimentos.org</li>
                  <li className="text-gray-300">+1 (234) 567-890</li>
                  <li className="text-gray-300">Calle Solidaridad #123, Ciudad</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Síguenos</h3>
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-300 hover:text-white transition">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} Banco de Alimentos Solidarios. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}