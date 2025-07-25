import Link from "next/link"
import { ArrowLeft, Github, Users, Heart, Mail, Linkedin } from "lucide-react"
import Image from "next/image"

export default function ContribuyentesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
                <span className="font-medium">Volver al inicio</span>
              </Link>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Banco de Alimentos
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-[length:200px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="mb-6">
            <Users className="w-16 h-16 mx-auto mb-4 text-blue-200" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Nuestros <span className="text-blue-200">Contribuyentes</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Conoce a las personas excepcionales que con su talento y dedicación hicieron posible este proyecto
          </p>
        </div>
      </section>

      {/* Contributors Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Equipo de <span className="text-blue-600">Desarrollo</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Estudiantes de la ULEAM comprometidos con el impacto social a través de la tecnología
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {/* Michael Intriago */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Michael.png"
                    width={120}
                    height={120}
                    alt="Michael Intriago"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Especialista en React y Next.js con 5 años de experiencia en desarrollo frontend.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Michael Intriago</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="https://github.com/mintriago123"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Walther Gutierrez */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Walther.png"
                    width={120}
                    height={120}
                    alt="Walther Gutierrez"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Especialista en Java, Typescript y arquitectura de sistemas.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Walther Gutierrez</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="https://github.com/Walthergl66"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Willian Cabrera */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/William.jpg"
                    width={120}
                    height={120}
                    alt="Willian Cabrera"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrollador full stack con experiencia en múltiples tecnologías.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Willian Cabrera</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="https://github.com/4NDR3S-01"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Anderson Santiana*/}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/AndersonS.jpg"
                    width={120}
                    height={120}
                    alt="Anderson Santiana"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrollador full stack con experiencia en múltiples tecnologías.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Anderson Santiana</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="https://github.com/4NDR3S-01"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>
          
            {/* Cinthia Zambrano */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Cinthia.jpg"
                    width={120}
                    height={120}
                    alt="Cinthia Zambrano"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrolladora con enfoque en soluciones escalables y robustas.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Cinthia Zambrano</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Robinson Moreira */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Robinson.jpg"
                    width={120}
                    height={120}
                    alt="Robinson Moreira"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrolladora con enfoque en soluciones escalables y robustas.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Robinson Moreira</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="https://github.com/SantianaT"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Odalia Senge Loor */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/OdaliaS.png"
                    width={120}
                    height={120}
                    alt="Odalia Senge Loor"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrolladora con enfoque en soluciones escalables y robustas.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Odalia Senge Loor</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="https://www.linkedin.com/in/odalis-senge-96945b2a8/"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Lizzardi Milazzo */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/LizzardiM.jpg"
                    width={120}
                    height={120}
                    alt="Lizzardi Milazzo"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Especialista en diseño de interfaces y experiencia de usuario.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Lizzardi Milazzo</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Maykel Menendez */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Mayk.jpg"
                    width={120}
                    height={120}
                    alt="Maykel Menendez"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Experto en bases de datos y optimización de consultas.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Maykel Menendez</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Kristhian Bello */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Kristhian.png"
                    width={120}
                    height={120}
                    alt="Kristhian Bello"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrollador backend con enfoque en seguridad y rendimiento.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Kristhian Bello</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Isaac Zacharias Alcivar */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/IsaacZ.png"
                    width={120}
                    height={120}
                    alt="Isaac Zacharias Alcivar"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Especialista en integración de sistemas y APIs.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Isaac Zacharias Alcivar</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Emilio Cardenas */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/EmilioC.png"
                    width={120}
                    height={120}
                    alt="Emilio Cardenas"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrollador full stack con experiencia en múltiples frameworks.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Emilio Cardenas</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Jhon Kenedy Garcia */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Jhon.png"
                    width={120}
                    height={120}
                    alt="Jhon Kenedy Garcia"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Desarrollador full stack con experiencia en múltiples frameworks.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Jhon Kenedy Garcia</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>

            {/* Elisa Ruiz Lavayen */}
            <div className="text-center p-6 hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 bg-white group relative overflow-hidden hover:-translate-y-1">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-blue-50 p-1 group-hover:border-blue-100 transition-colors duration-300">
                  <Image
                    src="/Elisa.png"
                    width={120}
                    height={120}
                    alt="Elisa Ruiz Lavayen"
                    className="w-full h-full rounded-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <p className="text-sm text-gray-700 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    Especialista en testing y calidad de software.
                  </p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Elisa Ruiz Lavayen</h3>
              <p className="text-gray-500 text-sm mb-4">Full Stack Developer</p>
              <div className="flex justify-center space-x-3">
                <Link
                  href="https://github.com/Akamnex666"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </Link>
                <Link
                  href="https://www.linkedin.com/in/eli-z-ruiz-a1907b377/"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>

          

          {/* Team Photo */}
          <div className="overflow-hidden shadow-lg rounded-xl border border-gray-100 mb-16">
            <div className="p-0">
              <Image
                src="/ImagenEquipo.jpg"
                width={800}
                height={400}
                alt="Equipo de desarrollo trabajando juntos"
                className="w-full object-cover h-96"
              />
              <div className="p-8 bg-gradient-to-r from-blue-50 to-blue-100">
                <p className="text-center text-gray-700 text-xl font-medium leading-relaxed">
                  "Trabajando juntos para crear soluciones tecnológicas con impacto social positivo"
                </p>
              </div>
            </div>
          </div>

          {/* GitHub Repository */}
          <div className="text-center">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 text-white shadow-lg">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Github className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Código Fuente</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                Este proyecto es de código abierto y está disponible en GitHub para que puedas contribuir o aprender de él.
              </p>
              <Link
                href="https://github.com/mintriago123/bancoalimentostest"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 hover:shadow-md"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-5 h-5 mr-2" />
                <span className="font-medium">Ver en GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                Banco de Alimentos ULEAM
              </h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
              Proyecto desarrollado con compromiso social por estudiantes de la Universidad Laica Eloy Alfaro de Manabí
            </p>
            <div className="flex justify-center space-x-4 mb-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Mail className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Banco de Alimentos ULEAM. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}