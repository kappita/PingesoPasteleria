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
  if (loading) return <div className="p-40 text-center">Cargando disponibilidad...</div>;

return (
  <main className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12 mx-auto">
    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center sm:text-left">
      Tu Carrito
    </h1>

    {cart.length === 0 ? (
      <div className="text-center py-12 sm:py-24 space-y-4 sm:space-y-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl">🛍️</span>
        </div>
        <p className="text-lg sm:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
          Tu carrito está vacío
        </p>
        <Link
          href="/products"
          className="block w-full sm:w-auto bg-[#E985A7] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-3xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-[#E985A7]/40 hover:bg-[#d96b8f] hover:scale-[1.02] transition-all disabled:opacity-50 max-w-sm mx-auto"
        >
          Ir a comprar
        </Link>
      </div>
    ) : (
      <div className="space-y-6 lg:space-y-8">
        {/* Lista de items */}
        <ul className="space-y-3 sm:space-y-4">
          {cart.map((item) => (
            <CartItemRow
              key={`${item.id}-${item.deliveryDate}`}
              item={item}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              getDailyRemaining={getDailyRemaining}
              globalRemaining={data?.global_remaining ?? 9999}
            />
          ))}
        </ul>

        {/* Footer del carrito */}
        <div className="mt-8 sm:mt-12 border-t pt-6 sm:pt-8 lg:pt-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-0">
            {/* Botón vaciar */}
            <button
              onClick={clearCart}
              className="text-gray-400 hover:text-red-500 text-sm text-center sm:text-base font-medium transition-colors md:self-start lg:self-auto order-2 lg:order-1"
            >
              Vaciar carrito
            </button>

            {/* Total y botones */}
            <div className="flex flex-col items-end gap-4 w-full lg:w-auto order-1 lg:order-2">
              <div className="flex justify-between w-full lg:w-auto gap-4 lg:gap-0 text-lg sm:text-xl lg:text-2xl">
                <span className="text-gray-600 font-medium hidden lg:inline">Total:</span>
                <span className="font-bold text-xl sm:text-3xl lg:text-2xl">${total.toFixed(2)}</span>
              </div>
              
              {/* Botón pago */}
              <button
                onClick={() => router.push("/checkout")}
                disabled={loading}
                className="w-full lg:w-auto bg-[#E985A7] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-3xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-[#E985A7]/40 hover:bg-[#d96b8f] hover:scale-[1.02] transition-all disabled:opacity-50 min-h-[48px]"
              >
                {loading ? "Verificando..." : "Ir al pago →"}
              </button>
              
              <button 
                onClick={() => router.push("/products")}
                className="text-pink-500 hover:text-pink-700 text-sm sm:text-base self-center font-medium md:self-end lg:self-auto"
              >
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </main>
);
}