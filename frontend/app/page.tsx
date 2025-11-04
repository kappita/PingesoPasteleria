import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8">Bienvenido a la Pastelería 🍰</h1>

      <div className="flex gap-4">
        <Link
          href="/products"
          className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-lg shadow-md transition"
        >
          Ver Productos
        </Link>

        <Link
          href="/us"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-lg shadow-md transition"
        >
          Contacto
        </Link>
      </div>
    </main>
  );
}
