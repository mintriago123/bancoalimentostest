import Link from "next/link"
import { ArrowLeft, Github, Users, Heart } from "lucide-react"
import Image from "next/image"

export default function ContribuyentesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors duration-10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al inicio
              </Link>
            </div>
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

      {/* Header */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <Users className="w-16 h-16 mx-auto mb-4 text-blue-100" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Nuestros Contribuyentes
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Conoce a las personas excepcionales que hicieron posible este proyecto
          </p>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Equipo de Desarrollo</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estudiantes de la ULEAM comprometidos con el impacto social
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">

        <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/Michael.png"
              width={120}
              height={120}
              alt="Michael Intriago"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en React y Next.js con 5 años de experiencia en desarrollo frontend.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Michael Intriago</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/mintriago123"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>


        <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/Walther.png"
              width={120}
              height={120}
              alt="Walther Gutierrez"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Walther Gutierrez</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/Walthergl66"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

        
        <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/Willian.png"
              width={120}
              height={120}
              alt="Willian Cabrera"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Willian Cabrera</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/OdaliaS.png"
              width={120}
              height={120}
              alt="Odalia Senge Loor"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Odalia Senge Loor</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/LizzardiM.jpg"
              width={120}
              height={120}
              alt="Lizzardi Milazzo"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Lizzardi Milazzo</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/Mayk.jpg"
              width={120}
              height={120}
              alt="Maykel Menendez"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Maykel Menendez</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/Kristhian.png"
              width={120}
              height={120}
              alt="Kristhian Bello"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Kristhian Bello</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/IsaacZ.png"
              width={120}
              height={120}
              alt="Isaac Zacharias Alcivar"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Isaac Zacharias Alcivar</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/EmilioC.png"
              width={120}
              height={120}
              alt="Emilio Cardenas"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Emilio Cardenas</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>
        
          <div className="text-center p-6 hover:shadow-xl transition-all duration-300 rounded-lg border-0 shadow-lg bg-white group relative overflow-hidden">
        <div className="relative mb-4 group">
            <Image
              src="/Elisa.png"
              width={120}
              height={120}
              alt="Elisa Ruiz Lavayen"
              className="mx-auto rounded-full border-4 border-blue-100 group-hover:opacity-20 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
              <p className="text-sm text-gray-700">
                Especialista en Java, Typescript y entendimiento de sistemas.
              </p>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Elisa Ruiz Lavayen</h3>
          <p className="text-gray-600 text-sm mt-2">Full Stack</p>
          <Link
            href="https://github.com/4NDR3S-01"
            className="inline-flex items-center mt-3 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5 mr-2" />
            <span>Ver GitHub</span>
          </Link>
        </div>

      </div>

          {/* Team Photo */}
          <div className="overflow-hidden shadow-xl rounded-lg border-0 mb-16">
            <div className="p-0">
              <Image
                src="/ImagenEquipo.jpg"
                width={800}
                height={400}
                alt="Equipo de desarrollo trabajando juntos"
                className="w-full object-cover h-96"
              />
              <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
                <p className="text-center text-gray-700 italic text-xl font-medium">
                  "Trabajando juntos para crear soluciones tecnológicas con impacto social"
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Repository */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Código Fuente</h3>
              <p className="text-gray-300 mb-6">
                Este proyecto es de código abierto y está disponible en GitHub
              </p>
              <Link
                href="https://github.com/mintriago123/bancoalimentostest"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5 mr-2" />
                Ver en GitHub
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold">Banco de Alimentos ULEAM</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Proyecto desarrollado con compromiso social por estudiantes de la Universidad Laica Eloy Alfaro de Manabí
            </p>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Banco de Alimentos ULEAM.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
