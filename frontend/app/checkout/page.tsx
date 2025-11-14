"use client";
import { useCart } from "../context/CartContext";
import { useDeliveryAvailability } from "../hooks/useDeliveryAvailability";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createHold, clearHold } from "../lib/wcpdd";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { data, loading: loadingAvailability, getDailyRemaining, refresh } = useDeliveryAvailability();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address_1: "",
    city: "",
    country: "CL",
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (!cart) return <p>Cargando carrito...</p>;

  const handleCheckout = async () => {
    if (cart.length === 0){
        setMessage("El carrito esta vacío");
        return;
    }

    if(!form.first_name || !form.email || !form.address_1 || !form.city){
        setMessage("Completa todos los campos obligatorios");
        return;
    }

    try{
        setLoading(true);
        setMessage(null);

        const line_items = cart.map((item) => ({
        product_id: item.id,
        variation_id: item.variation_id || undefined,
        quantity: item.quantity,
        }));

        const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payment_method: "transbank_webpay_plus_rest",
                payment_method_title: "Webpay Plus",
                set_paid: false,
                billing: form,
                line_items,
            }),
        });

        if (!response.ok) {
            throw new Error("Error al crear la orden");
        }

        const data = await response.json();

        window.location.href = `${process.env.NEXT_PUBLIC_WOOCOMMERCE_URL}/checkout/order-pay/${data.id}/?key=${data.order_key}`;
        clearCart();
        setMessage(`✅ Pedido #${data.id} creado correctamente.`);
    }
    catch (err: any) {
      console.error(err);
      setMessage("❌ Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  async function reserveSlots() {
    try {
      for (const item of cart) {
        if (item.deliveryDate) {
          await createHold(item.deliveryDate, item.quantity);
        }
      }
      await refresh();
      console.log("✅ Hold temporal creado");
    } catch (err) {
      console.error("Error creando hold temporal:", err);
    }
  }

  async function releaseHold() {
    try {
      await clearHold();
      console.log("🧹 Hold temporal liberado");
      await refresh();
    } catch (err) {
      console.error("Error liberando hold:", err);
    }
  }

  // Crear hold al entrar
  if (cart.length > 0) reserveSlots();

  // Liberar hold al salir o recargar la página
  window.addEventListener("beforeunload", releaseHold);

  return () => {
    releaseHold(); // liberar si el componente se desmonta
    window.removeEventListener("beforeunload", releaseHold);
  };
}, [cart, refresh]);


  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Finalizar compra</h1>

      {cart.length === 0 ? (
        <div className="text-center">
          <p>Tu carrito está vacío.</p>
          <Link href="/products" className="text-pink-600 underline">
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Datos de facturación</h2>
                <div className="space-y-3">
                    <input
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    value={form.first_name}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                    />
                    <input
                    type="text"
                    name="last_name"
                    placeholder="Apellido"
                    value={form.last_name}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                    />
                    <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                    />
                    <input
                    type="text"
                    name="address_1"
                    placeholder="Dirección"
                    value={form.address_1}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                    />
                    <input
                    type="text"
                    name="city"
                    placeholder="Ciudad"
                    value={form.city}
                    onChange={handleChange}
                    className="border rounded p-2 w-full"
                    />
                </div>
            </div>
            <div>

              {loadingAvailability ? (
                  <p className="text-gray-500 mb-4">Cargando disponibilidad global...</p>
                ) : data ? (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h2 className="text-lg font-semibold mb-2">Disponibilidad de entrega</h2>
                    <p className="text-gray-700">
                      🌐 Cupos globales restantes:{" "}
                      <span className="font-bold text-pink-600">{data.global_remaining}</span> / {data.global_capacity}
                    </p>
                  </div>
                ) : (
                  <p className="text-red-500 mb-4">No se pudo cargar la disponibilidad.</p>
                )}
                <h2 className="text-xl font-semibold mb-4">Tu pedido</h2>

                <ul className="mb-6">
                    {cart.map((item: any) => (
                    <li
                    key={`${item.id}-${item.variation_id ?? "base"}`}
                    className="flex justify-between items-center border-b pb-2"
                    >
                        <span className="text-gray-800">
                        {item.name} × {item.quantity}
                        </span>
                        <p>Fecha de entrega : {item.deliveryDate}</p>

                        {item.deliveryDate && (
                          <p>
                            📅 Cupos diarios para {item.deliveryDate}:{" "}
                            <span className="font-semibold">
                              {getDailyRemaining(item.deliveryDate) ?? "N/D"}
                            </span>
                          </p>
                        )}

                        <span className="text-gray-700 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                        </span>
                    </li>
                ))}
                </ul>

                <p className="font-bold text-xl">
                Total: $
                {cart
                .reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
                .toFixed(2)}
                </p>

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                >
                    {loading ? "Procesando..." : "Confirmar pedido"}
                </button>
            </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-6 text-center p-3 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {message}
        </div>
      )}
    </main>
  );
}
