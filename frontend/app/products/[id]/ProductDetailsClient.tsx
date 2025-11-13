"use client";
import { useCart } from "../../context/CartContext";
import DeliveryDatePicker from "../../components/DeliveryDatePicker";
import { useState, useEffect } from "react";
import { useDeliveryAvailability } from "../../hooks/useDeliveryAvailability";

export default function ProductDetailsClient({ product, variations }: any) {
  const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
  const [currentVariation, setCurrentVariation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const { data, getDailyRemaining, refresh } = useDeliveryAvailability();
  const { addToCart } = useCart();

  useEffect(() => {
    if (deliveryDate) refresh();
  }, [deliveryDate]);

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
      deliveryDate: deliveryDate,
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
          max={
            deliveryDate
              ? Math.min(
                  getDailyRemaining(deliveryDate) ?? 1,
                  data?.global_remaining ?? 1
                )
              : 1
          }
          value={quantity}
          onChange={(e) => {
            const val = Number(e.target.value);
            const maxVal =
              deliveryDate
                ? Math.min(
                    getDailyRemaining(deliveryDate) ?? 1,
                    data?.global_remaining ?? 1
                  )
                : 1;
            if (val > maxVal) {
              setMessage(`⚠️ Solo quedan ${maxVal} cupos disponibles`);
              setQuantity(maxVal);
            } else {
              setQuantity(val);
              setMessage(null);
            }
          }}
          className="border rounded-lg p-2 w-20 text-center"
        />
      </div>

      {/* Mostrar precio */}
      <p className="text-2xl font-semibold mb-6">
        Precio total: ${ (parseFloat(currentPrice) * quantity).toFixed(2) }
      </p>


      <DeliveryDatePicker
        value={deliveryDate}
        onChange={(d) => setDeliveryDate(d)}
      />
      {/* Mostrar cupos */}
      {data && (
        <div className="mt-3 text-sm text-gray-700">
          <p>
            🧮 Cupo global disponible:{" "}
            <span className="font-semibold">{data.global_remaining}</span>
          </p>

          {deliveryDate && (
            <p>
              📅 Cupos diarios para {deliveryDate}:{" "}
              <span className="font-semibold">
                {getDailyRemaining(deliveryDate) ?? "Sin datos"}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Botón agregar al carrito */}
      <button
        onClick={handleAddToCart}
        disabled={
          !deliveryDate || // no hay fecha seleccionada
          (getDailyRemaining(deliveryDate) ?? 0) <= 0 || // sin cupos diarios
          (data?.global_remaining ?? 0) <= 0 // sin cupos globales
        }
        className={`px-6 py-3 rounded-xl transition ${
          !deliveryDate ||
          (getDailyRemaining(deliveryDate) ?? 0) <= 0 ||
          (data?.global_remaining ?? 0) <= 0
            ? "bg-gray-300 cursor-not-allowed text-gray-600"
            : "bg-pink-500 text-white hover:bg-pink-600"
        }`}
      >
        {(!deliveryDate ||
          (getDailyRemaining(deliveryDate) ?? 0) <= 0 ||
          (data?.global_remaining ?? 0) <= 0)
          ? "No disponible"
          : "Agregar al carrito"}
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
