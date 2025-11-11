import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF1DB]">
      <section className="flex justify-center items-center relative -mt-80">
        <div className="flex flex-col md:flex-row items-center w-full max-w-7xl mx-auto">
          <div className="flex-shrink-0 flex items-center justify-center w-[430px] h-[430px] relative z-10">
            <div className="overflow-hidden rounded-full w-[500px] h-[500px]">
              <img
                src="/assets/landingPhoto.png"
                alt="Pastelera con torta"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          <div className="bg-[#fbbb5b] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] rounded-tl-[0px] p-24 flex-1 flex flex-col justify-center min-h-[350px] -ml-48 z-0">
            <h2 className="font-bold text-white text-5xl mb-4 translate-x-30 ">Tortas con Diseños</h2>
            <hr className="border-white/80 mb-3 translate-x-32 overflow-hidden w-[80%]" />
            <p className="text-white text-md font-semibold translate-x-32 w-[80%]">
              Pastelería fina y coctelería tortas con diseño. Ofrecemos una amplia gama de productos, para todas tus celebraciones y eventos. Con productos de calidad, sin pre mezclas, 100% artesanal. Años de experiencia en el rubro. Chef Pastelera titulada. Especializada en pastelería nacional e internacional, capacitada para pastelería saludable, sin gluten, sin azúcar, sin lactosa, también en coctelería dulce y salada.
            </p>
          </div>
        </div>
        <a
          href="https://wa.me/56912345678"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed md:absolute bottom-6 right-6 md:-bottom-4 md:-right-12 z-50 bg-green-500 rounded-full shadow-2xl p-3 transition-transform hover:scale-110 flex items-center justify-center"
          aria-label="Whatsapp"
        >
          <img
            src="/assets/whatsapp.svg"
            alt="Whatsapp"
            className="w-16 h-16"
            draggable={false}
          />
        </a>


      </section>
    </main>
  );
}
