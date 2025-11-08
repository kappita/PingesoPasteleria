"use client";
import { useCart } from "../../context/CartContext";
import { useState, useEffect } from "react";

export default function ProductDetailsClient({ product, variations }: any) {
  const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
  const [currentVariation, setCurrentVariation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Actualiza la variación actual cuando cambian los selects
  useEffect(() => {
    if (product.type !== "variable") return;

    const match = variations.find((v: any) =>
      v.attributes.every(
        (a: any) =>
          selectedAttrs[a.name] &&
          selectedAttrs[a.name].toLowerCase() === a.option.toLowerCase()
      )
    );

    setCurrentVariation(match || null);
  }, [selectedAttrs, variations, product.type]);

  // Manejador genérico para cada atributo (ej: Tamaño, Sabor)
  const handleSelectChange = (attrName: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  // Precio actual
  const currentPrice =
    currentVariation?.price || product.price || "N/A";

  // Agregar al carrito
  const handleAddToCart = () => {
    if (product.type === "variable" && !currentVariation) {
      setMessage("⚠️ Debes seleccionar todas las opciones antes de agregar al carrito.");
      return;
    }

    if (quantity < 1) {
      setMessage("⚠️ La cantidad debe ser al menos 1.");
      return;
    }

    const item = currentVariation || product;

    addToCart({
      id: item.id,
      name: product.name,
      price: parseFloat(item.price),
      quantity,
      image: item.image?.src || product.images[0]?.src,
      attributes: selectedAttrs,
    });

    setMessage("✅ Producto añadido al carrito!");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

      <img
        src={currentVariation?.image?.src || product.images[0]?.src}
        alt={product.name}
        className="w-full h-96 object-cover rounded-xl mb-6"
      />

      <p className="text-gray-700 mb-4">
        {product.short_description?.replace(/<[^>]+>/g, "")}
      </p>

      {/* Si es producto variable, mostrar selects dinámicos */}
      {product.type === "variable" &&
        product.attributes.map((attr: any) => (
          <div key={attr.name} className="mb-4">
            <label className="block mb-2 text-lg font-medium">
              Selecciona {attr.name.toLowerCase()}:
            </label>
            <select
              onChange={(e) => handleSelectChange(attr.name, e.target.value)}
              value={selectedAttrs[attr.name] || ""}
              className="border rounded-lg p-3 w-full max-w-sm"
            >
              <option value="">-- Selecciona una opción --</option>
              {attr.options.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}

      {/* Seleccionar cantidad */}
      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="quantity" className="text-lg font-medium">
          Cantidad:
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="border rounded-lg p-2 w-20 text-center"
        />
      </div>

      {/* Mostrar precio */}
      <p className="text-2xl font-semibold mb-6">
        Precio total: ${ (parseFloat(currentPrice) * quantity).toFixed(2) }
      </p>

      {/* Botón agregar al carrito */}
      <button
        onClick={handleAddToCart}
        className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600"
      >
        Agregar al carrito
      </button>

      {/* Mensaje de confirmación */}
      {message && (
        <div
          className={`mt-4 text-center p-3 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
