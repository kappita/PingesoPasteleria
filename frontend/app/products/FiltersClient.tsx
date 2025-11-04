"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FiltersClient({ categories }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const applyFilters = () => {
    const query = new URLSearchParams();
    if (selectedCategory) query.set("category", selectedCategory);
    if (minPrice) query.set("min_price", minPrice);
    if (maxPrice) query.set("max_price", maxPrice);

    router.push(`/products?${query.toString()}`);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    router.push(`/products`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Filtros</h2>

      {/* Categorías */}
      <div>
        <h3 className="font-semibold mb-2">Categoría</h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Todas</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Precio */}
      <div>
        <h3 className="font-semibold mb-2">Rango de precios</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="number"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border p-2 rounded w-1/2"
          />
        </div>
      </div>

      <button
        onClick={applyFilters}
        className="w-full bg-pink-500 text-white rounded p-2 hover:bg-pink-600"
      >
        Aplicar filtros
      </button>

      <button
        onClick={clearFilters}
        className="w-full border border-gray-300 rounded p-2 mt-2 hover:bg-gray-100"
      >
        Limpiar
      </button>
    </div>
  );
}
