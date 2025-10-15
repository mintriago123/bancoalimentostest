import Link from "next/link"
import { Heart, User, Users, Package, Truck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Banco de Alimentos
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Nutriendo vidas, <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Optimizando recursos
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Recolectamos alimentos que serán distribuidos entre quienes más lo necesitan. Únete a nuestra misión y sé
            parte de este gran cambio social.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/auth/registrar?rol=DONANTE">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 py-4 rounded-md text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Heart className="w-5 h-5 mr-2" />
                Registrarse
              </button>
            </Link>
            <Link href="/auth/iniciar-sesion">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-11 px-8 py-4 rounded-md text-lg border-2 border-blue-600 text-blue-700 hover:bg-blue-50 bg-transparent">
                <User className="w-5 h-5 mr-2" />
                Iniciar sesión
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Statistics */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-center p-8 hover:bg-white/20 transition-all duration-300 rounded-lg">
              <div className="p-0">
                <p className="text-5xl font-bold mb-2">1.3B</p>
                <p className="text-lg text-blue-100">Toneladas de alimentos se desperdician anualmente</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-center p-8 hover:bg-white/20 transition-all duration-300 rounded-lg">
              <div className="p-0">
                <p className="text-5xl font-bold mb-2">800M</p>
                <p className="text-lg text-blue-100">Personas pasan hambre en el mundo</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-center p-8 hover:bg-white/20 transition-all duration-300 rounded-lg">
              <div className="p-0">
                <p className="text-5xl font-bold mb-2">10K+</p>
                <p className="text-lg text-blue-100">Familias ayudadas mensualmente</p>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona nuestro banco de alimentos?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un proceso simple y efectivo para maximizar el impacto social
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg">
              <div className="p-0">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Recolección</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recogemos alimentos excedentes de supermercados, restaurantes y productores locales.
                </p>
              </div>
            </div>

            <div className="text-center p-8 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg">
              <div className="p-0">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Clasificación</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nuestros voluntarios clasifican y almacenan los alimentos siguiendo estrictos protocolos de calidad.
                </p>
              </div>
            </div>

            <div className="text-center p-8 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg">
              <div className="p-0">
                <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="h-10 w-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Distribución</h3>
                <p className="text-gray-600 leading-relaxed">
                  Entregamos los alimentos a organizaciones benéficas y familias que más lo necesitan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>









      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Banco de Alimentos Solidarios</h3>
              </div>
          
          
              <div className="flex items-center space-x-4">
                <Link
                  href="/contribuyentes"
                  className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Ver Contribuyentes
                </Link>
              </div>

            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Participa</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/donar" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Donar alimentos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/voluntariado"
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                  >
                    Ser voluntario
                  </Link>
                </li>
                <li>
                  <Link href="/empresas" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Para empresas
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3 text-gray-300">
                <li>info@bancodealimentos.org</li>
                <li>+1 (234) 567-890</li>
                <li>Calle Solidaridad #123, Ciudad</li>
              </ul>
            </div>
          </div>

          {/* Commemorative Message */}
          <div className="border-t border-gray-700 pt-8">
            <div className="text-center space-y-4">
              <p className="text-blue-400 font-semibold text-lg italic">&quot;Juntos nutrimos sueños, sembramos futuro.&quot;</p>
              <p className="text-gray-400">
                Este proyecto fue desarrollado con compromiso social por estudiantes de la ULEAM como parte del programa
                de vinculación con la comunidad.
              </p>
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Banco de Alimentos ULEAM.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}