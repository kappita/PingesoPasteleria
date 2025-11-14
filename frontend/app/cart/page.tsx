"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useDeliveryAvailability } from "../hooks/useDeliveryAvailability";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const { data, getDailyRemaining, loading } = useDeliveryAvailability();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) return <p>Cargando disponibilidad...</p>;
  if (!data) return <p>No se pudo cargar disponibilidad</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-6">Tu carrito está vacío 🛍️</p>
          <Link
            href="/products"
            className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600"
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between border rounded-xl p-4 shadow-sm bg-white"
              >
                <div className="flex items-center gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}

                  {/* Nombre, fecha, cupos y precio */}
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>

                    {/* Fecha seleccionada */}
                    {item.deliveryDate ? (
                      <p className="text-sm text-gray-700">
                        📅 Entrega: <span className="font-medium">{item.deliveryDate}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Sin fecha seleccionada</p>
                    )}

                    {/* Cupos globales */}
                    <p className="text-sm text-gray-700">
                      🌐 Cupos globales restantes:{" "}
                      <span className="font-semibold">{data.global_remaining}</span>
                    </p>

                    {/* Cupos diarios (solo si hay fecha seleccionada) */}
                    {item.deliveryDate && (
                      <p className="text-sm text-gray-700">
                        🧮 Cupos diarios disponibles para esta fecha:{" "}
                        <span className="font-semibold">
                          {getDailyRemaining(item.deliveryDate) ?? "N/D"}
                        </span>
                      </p>
                    )}

                    {/* Precio unitario */}
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold">{item.quantity}</span>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
            >
              Vaciar carrito
            </button>

            <div className="text-right">
              <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
              <Link
                href="../checkout"
                className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 mt-3 inline-block"
              >
                Ir al pago →
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
