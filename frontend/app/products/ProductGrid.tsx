import Link from "next/link";

export default function ProductGrid({ products, currentPage, totalPages }: any) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="border rounded-2xl shadow p-4 hover:shadow-lg transition block"
          >
            <img
              src={product.images[0]?.src}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h2 className="text-lg font-semibold mt-3">{product.name}</h2>
            <p className="text-gray-600">${product.price}</p>
          </Link>
        ))}
      </div>

      <div className="flex justify-center mt-10 gap-4">
        {currentPage > 1 && (
          <Link href={`/products?page=${currentPage - 1}`} className="px-4 py-2 bg-gray-200 rounded-lg">
            ← Anterior
          </Link>
        )}
        <span className="px-4 py-2">Página {currentPage} de {totalPages}</span>
        {currentPage < totalPages && (
          <Link href={`/products?page=${currentPage + 1}`} className="px-4 py-2 bg-gray-200 rounded-lg">
            Siguiente →
          </Link>
        )}
      </div>
    </div>
  );
}
