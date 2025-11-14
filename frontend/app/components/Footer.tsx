export default function Footer() {
  return (
    <footer className="bg-[#e991b5] py-10 w-full text-white flex flex-col items-center justify-center">
      {/* Logo central grande */}
      <img
        src="/assets/logo.png" // Usa tu logo en blanco aquí
        alt="Tortas con Diseños"
        className="w-96 max-w-xs mx-auto mb-10 filter grayscale"
      />

      {/* Menú horizontal central */}
      <nav className="flex space-x-12 mb-8">
        <a href="#inicio" className="font-medium text-lg underline underline-offset-4 hover:text-[#faecd8] transition">Inicio</a>
        <a href="#desayunos" className="font-medium text-lg underline underline-offset-4 hover:text-[#faecd8] transition">Desayunos</a>
        <a href="#catering" className="font-medium text-lg underline underline-offset-4 hover:text-[#faecd8] transition">Catering</a>
        <a href="#pasteleria" className="font-medium text-lg underline underline-offset-4 hover:text-[#faecd8] transition">Pastelería</a>
      </nav>

      {/* Info institucional abajo izquierda */}
      <div className="absolute left-10 bottom-8 text-left text-white/90 text-base">
        <p>&copy; 2025 Tortas con Diseños</p>
        <p>Desarrollado por</p>
      </div>
    </footer>
  );
}
