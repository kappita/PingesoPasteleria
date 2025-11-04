"use client";

import { useState } from "react";

export default function ProductDetailsClient({ product, variations }: any) {
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value;
    const foundVariation = variations.find((v: any) =>
      v.attributes.some((a: any) => a.option === option)
    );
    setSelectedVariation(foundVariation);
  };

  const currentPrice =
    selectedVariation?.price || product.price || "N/A";

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

      <img
        src={selectedVariation?.image?.src || product.images[0]?.src}
        alt={product.name}
        className="w-full h-96 object-cover rounded-xl mb-6"
      />

      <p className="text-gray-700 mb-4">
        {product.short_description?.replace(/<[^>]+>/g, "")}
      </p>

      {product.type === "variable" && (
        <div className="mb-6">
          <label htmlFor="variation" className="block mb-2 text-lg font-medium">
            Selecciona un tamaño:
          </label>

          <select
            id="variation"
            onChange={handleSelectChange}
            defaultValue=""
            className="border rounded-lg p-3 w-full max-w-sm"
          >
            <option value="" disabled>
              -- Selecciona una opción --
            </option>
            {product.attributes[0]?.options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="text-2xl font-semibold mb-6">
        Precio: ${currentPrice}
      </p>

      <button
        disabled={!selectedVariation && product.type === "variable"}
        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-lg shadow transition disabled:opacity-50"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
