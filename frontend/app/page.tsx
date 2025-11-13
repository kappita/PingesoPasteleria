import Link from "next/link";

const catalogItems = [
  {
    name: "Coctelería Salada",
    image: "/assets/cocteleria.jpg",
  },
  {
    name: "Macarons",
    image: "/assets/macarons.png",
  },
  {
    name: "Queques",
    image: "/assets/queque.png",
    featured: true,
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF1DB]">
      <section className="flex justify-center items-center relative mt-28">
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


      <section className="py-28">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[#fbbb5b]">
          Conoce nuestro catálogo
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={catalogItems[0].image}
                alt={catalogItems[0].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full px-4 pb-3 text-white text-lg font-semibold bg-gradient-to-t from-black/50 to-transparent">
                {catalogItems[0].name}
                <div className="border-t border-white/40 mt-1 w-full" />
              </div>
            </div>
            {/* Tarjeta 4 */}
            <div className="relative aspect-[4/2] rounded-xl overflow-hidden">
              <img
                src={catalogItems[1].image}
                alt={catalogItems[1].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full px-4 pb-3 text-white text-lg font-semibold bg-gradient-to-t from-black/40 to-transparent">
                {catalogItems[1].name}
                <div className="border-t border-white/40 mt-1 w-full" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/2] rounded-xl overflow-hidden">
              <img
                src={catalogItems[1].image}
                alt={catalogItems[1].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full px-4 pb-3 text-white text-lg font-semibold bg-gradient-to-t from-black/40 to-transparent">
                {catalogItems[1].name}
                <div className="border-t border-white/40 mt-1 w-full" />
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={catalogItems[2].image}
                alt={catalogItems[2].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 w-full px-4 pb-3 text-white text-lg font-semibold bg-gradient-to-t from-black/40 to-transparent">
                {catalogItems[2].name}
                <div className="border-t border-white/40 mt-1 w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
