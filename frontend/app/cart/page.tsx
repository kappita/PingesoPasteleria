"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useDeliveryAvailability } from "../hooks/useDeliveryAvailability";
import CartItemRow from "../context/CartItemRow";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();

  // 1. LLAMAMOS AL HOOK AQUÍ (Una sola vez para toda la página)
  const { data, getDailyRemaining, loading } = useDeliveryAvailability();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Opcional: Mostrar loading mientras carga la disponibilidad
  if (loading) return <div className="p-10 text-center">Cargando disponibilidad...</div>;

  return (
    <main className="w-[50%] p-16 mx-auto p-getOrder6">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center mb-24">
          <p className="text-gray-600 mb-6">Tu carrito está vacío 🛍️</p>
          <Link
            href="/products"
            className="w-[50%]  bg-[#E985A7] text-white px-6 py-3 rounded-4xl font-semibold text-lg shadow-lg hover:shadow-[#E985A7]/40 hover:bg-[#d96b8f] hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <>
          {/* <ul className="space-y-4">
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
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-gray-600">${item.price}</p>
                    <p className="text-gray-600">{`Para entrega el día ${item.deliveryDate}`}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(item.quantity - 1, 1))
                    }
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
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
          </ul> */}
          <ul className="space-y-4">
            {cart.map((item) => (
              // 2. RENDERIZAMOS LA FILA CON LA DATA DEL HOOK
              <CartItemRow
                key={`${item.id}-${item.deliveryDate}`} // Key única
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                // Pasamos las herramientas de validación
                getDailyRemaining={getDailyRemaining}
                globalRemaining={data?.global_remaining ?? 9999} // Valor alto por defecto si no ha cargado
              />
            ))}
          </ul>

          {/* Footer del carrito */}
          <div className="mt-8 border-t pt-8">
            <div className="flex justify-between items-start">
                <button
                onClick={clearCart}
                className="text-gray-400 hover:text-red-500 text-sm transition-colors mt-2"
                >
                Vaciar carrito
                </button>

                <div className="flex flex-col items-end gap-4 w-full max-w-md">
                    <div className="flex justify-between w-full text-xl">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-2xl">${total.toFixed(2)}</span>
                    </div>
                    
                    {/* Botón de pago */}
                    {/* Podrías deshabilitarlo si loading es true */}
                    <button
                        onClick={() => router.push("/checkout")}
                        disabled={loading}
                        className="w-[50%]  bg-[#E985A7] text-white px-6 py-3 rounded-4xl font-semibold text-lg shadow-lg hover:shadow-[#E985A7]/40 hover:bg-[#d96b8f] hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        {loading ? "Verificando disponibilidad..." : "Ir al pago →"}
                    </button>
                    
                    <button 
                        onClick={() => router.push("/products")}
                        className="text-pink-500 hover:text-pink-700 text-sm font-medium"
                    >
                        Seguir comprando
                    </button>
                </div>
            </div>
          </div>

          {/* <div className="mt-8 flex justify-between items-center">
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
          </div> */}
        </>
      )}
    </main>
  );
}
