"use client";
import { useCart } from "../context/CartContext";
import { useDeliveryAvailability } from "../hooks/useDeliveryAvailability";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createHold, clearHold } from "../lib/wcpdd";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!); // Inicializa MercadoPago con la clave pública

type Fulfillment = "delivery" | "pickup";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { data, loading: loadingAvailability, getDailyRemaining, refresh } = useDeliveryAvailability();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // REF 1: Para evitar que se liberen los cupos mientras creamos la orden
  const isProceedingToPayment = useRef(false);
  // REF 2: Para evitar doble reserva en modo estricto
  const hasReserved = useRef(false);
  const [deliveryType, setDeliveryType] = useState<Fulfillment>("delivery");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address_1: "",
    city: "",
    country: "CL",
    phone: ""
  });

  const [shippingForm, setShippingForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "CL"
  }
  )

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  // --- LÓGICA DE CUPOS (HOLDS) ---
  useEffect(() => {
    const reserveSlots = async () => {
      if (cart.length === 0) return;
      try {
        console.log("🔒 Reservando cupos...");
        // Reservar en paralelo para eficiencia
        const promises = cart
          .filter(item => item.deliveryDate)
          .map(item => createHold(item.deliveryDate, item.quantity));

        await Promise.all(promises);
        await refresh();
        console.log("✅ Cupos reservados temporalmente");
      } catch (err) {
        console.error("Error creando hold:", err);
      }
    };

    const releaseHold = async () => {
      // Solo liberamos si NO estamos en proceso de pago/creación de pedido
      if (!isProceedingToPayment.current) {
        try {
          await clearHold();
          console.log("🧹 Cupos liberados (usuario salió)");
        } catch (err) {
          console.error("Error liberando hold:", err);
        }
      }
    };

    // Reservar al montar
    if (!hasReserved.current && cart.length > 0) {
      reserveSlots();
      hasReserved.current = true;
    }

    // Liberar al cerrar pestaña
    const handleBeforeUnload = () => {
      if (!isProceedingToPayment.current) {
        clearHold();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup al desmontar
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      releaseHold();
    };
  }, []);

  // --- NUEVA FUNCIÓN: CANCELAR ORDEN SI SE ARREPIENTE ---
  const handleCancelOrder = async () => {
    if (!orderId) {
      setPreferenceId(null);
      return;
    }

    try {
      setLoading(true);
      // Llamada a tu API para borrar el pedido en WP y liberar stock
      await fetch(`/api/orders?id=${orderId}`, {
        method: "DELETE"
      });

      // Limpiamos estados
      setOrderId(null);
      setPreferenceId(null);

      // Volvemos a activar la protección de cupos temporales 
      // para que sigan reservados mientras edita el carrito
      isProceedingToPayment.current = false;

      setMessage("Pedido anterior cancelado. Puedes modificar tu carrito.");
    } catch (error) {
      console.error("Error cancelando orden", error);
      // Si falla el borrado, igual dejamos al usuario volver, pero avisamos
      setMessage("Hubo un problema cancelando la orden anterior, pero puedes seguir editando.");
      setPreferenceId(null);
      isProceedingToPayment.current = false;
    } finally {
      setLoading(false);
    }
  };


  if (!cart) return <p>Cargando carrito...</p>;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage("El carrito esta vacío");
      return;
    }

    if (!form.first_name || !form.email || !form.address_1 || !form.city || !form.phone) {
      setMessage("Completa todos los campos obligatorios");
      return;
    }

    if (deliveryType == 'delivery' && (!shippingForm.first_name || !shippingForm.last_name || !shippingForm.email || !shippingForm.address_1 || !shippingForm.city)) {
      setMessage("Completa todos los campos obligatorios")
      console.log(shippingForm)
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      isProceedingToPayment.current = true;

      // const line_items = cart.map((item) => ({
      //   product_id: item.product_id || item.id,
      //   variation_id: item.variation_id || undefined,
      //   quantity: item.quantity,
      //   meta_data: [{
      //     id: 1,
      //     key: "Fecha de entrega",
      //     value: item.deliveryDate
      //   }]
      //   }));

      const line_items = cart.map((item) => {

        // 1. Convertimos los atributos del carrito (Objeto) al formato de API (Array)
        const variation_attributes = item.attributes
          ? Object.entries(item.attributes).map(([key, value]) => ({
            attribute: key,
            value: value
          }))
          : [];

        const atributosComoMeta = item.attributes
          ? Object.entries(item.attributes).map(([key, value]) => ({
            key: key,
            value: value
          }))
          : [];

        return {
          product_id: item.product_id || item.id, // ID del padre
          variation_id: item.variation_id || undefined, // ID de la variación
          quantity: item.quantity,

          variation: variation_attributes,
          // -----------------------------

          meta_data: [{
            key: "Fecha de entrega",
            value: item.deliveryDate
          }, ...atributosComoMeta]
        };
      });

      // 2. RECUPERAR ESTO: Calcular la fecha global (la más próxima)
      const fechas = cart
        .map((item) => item.deliveryDate)
        .filter((d) => d)
        .sort();
      const fechaGlobal = fechas.length > 0 ? fechas[0] : "";

      const article_descriptions = cart.reduce((acc, cur, idx) => acc + (idx ? "\n" : "") + `${cur.name} &times; ${cur.quantity}`, "");
      let body: any = {
        payment_method: "mercadopago",
        payment_method_title: "Mercado Pago",
        set_paid: false,
        fulfillment: 'pickup',
        billing: form,
        line_items,
        meta_data: [
          {
            key: "_wcpdd_delivery_date",
            value: fechaGlobal
          }
        ]
      }

      if (deliveryType === 'delivery') {
        body = {
          ...body,
          shipping: shippingForm
        }
      }

      if (deliveryType === 'pickup') {
        body = {
          ...body,
          shipping_lines: [
            {
              "method_id": "local_pickup", "method_title": "Recogida (Local)", "total": "0.00", meta_data: [{ "id": 1, "key": "pickup_address", "value": "Lo Errazuriz 879, Región Metropolitana de Santiago, 9201341 Santiago" },
              { "id": 2, "key": "pickup_location", "value": "Local" }, { "id": 3, "key": "Artículos", "value": article_descriptions }]
            }
          ]
        }
      }




      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!orderResponse.ok) throw new Error("Error al crear la orden en WP");
      const orderData = await orderResponse.json();

      setOrderId(orderData.id);

      // Crear preferencia de pago en Mercado Pago
      const mpRes = await fetch("/api/mercado-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.id,
          items: cart.map(i => ({
            title: i.name,
            unit_price: Number(i.price),
            quantity: i.quantity,
            currency_id: "CLP"
          }))
        }),
      });

      const mpData = await mpRes.json();
      setPreferenceId(mpData.id);

      //clearCart();
      setMessage(`✅ Pedido #${orderData.id} creado correctamente.`);
    }
    catch (err: any) {
      isProceedingToPayment.current = false;
      setMessage("❌ Error al procesar el pedido. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

return (
  <main className="max-w-6xl mx-auto p-4 md:p-8 w-full">
    <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Finalizar compra</h1>
    
    {cart.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">Tu carrito está vacío.</p>
        <Link href="/products" className="inline-block bg-[#E985A7] text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition">
          Ir a comprar
        </Link>
      </div>
    ) : (
      <>
        {/* Formulario 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Columna izquierda: Datos facturación + entrega */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Datos de facturación</h2>
              <div className="space-y-3">
                <input
                  type="text" name="first_name" placeholder="Nombre"
                  value={form.first_name} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="last_name" placeholder="Apellido"
                  value={form.last_name} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="email" name="email" placeholder="Correo electrónico"
                  value={form.email} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="address_1" placeholder="Dirección"
                  value={form.address_1} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="city" placeholder="Ciudad"
                  value={form.city} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="tel" name="phone" placeholder="Número de celular o teléfono *"
                  value={form.phone} onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                  required
                />
              </div>
            </div>

            {/* Tipo entrega */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-6">
                Tipo de entrega
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button" onClick={() => setDeliveryType("delivery")}
                  className={[
                    "flex-1 h-16 rounded-2xl border-2 font-semibold shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#E985A7]/30",
                    deliveryType === "delivery"
                      ? "bg-[#E985A7] text-white border-[#E985A7] shadow-[#E985A7]/25 hover:shadow-[#E985A7]/40"
                      : "bg-white text-gray-900 border-gray-300 hover:border-[#E985A7]/50 hover:shadow-md hover:shadow-[#E985A7]/10"
                  ].join(" ")}
                >
                  🏍️ Envío a domicilio
                </button>
                <button
                  type="button" onClick={() => setDeliveryType("pickup")}
                  className={[
                    "flex-1 h-16 rounded-2xl border-2 font-semibold shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-[#E985A7]/30",
                    deliveryType === "pickup"
                      ? "bg-[#E985A7] text-white border-[#E985A7] shadow-[#E985A7]/25 hover:shadow-[#E985A7]/40"
                      : "bg-white text-gray-900 border-gray-300 hover:border-[#E985A7]/50 hover:shadow-md hover:shadow-[#E985A7]/10"
                  ].join(" ")}
                >
                  🏠 Retiro en local
                </button>
              </div>

              {/* Datos envío */}
              {deliveryType === 'delivery' && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de envío</h3>
                  {['first_name', 'last_name', 'email', 'address_1', 'city'].map((field) => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      placeholder={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      value={shippingForm[field as keyof typeof shippingForm] as string}
                      onChange={handleShippingChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                    />
                  ))}
                </div>
              )}
              
              {deliveryType === 'pickup' && (
                <div className="mt-6 p-6 border rounded-2xl bg-gradient-to-r from-gray-50 to-white shadow-sm">
                  <p className="text-gray-800 font-medium mb-2">
                    🏠 Retiro en: Lo Errazuriz 879, Santiago, Región Metropolitana
                  </p>
                  <a 
                    href="https://goo.gl/maps/GoogleMapsLink" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#E985A7] underline text-sm hover:text-pink-600 transition-colors"
                  >
                    Ver en Google Maps ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha: Productos + Total + Botón */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:h-screen lg:overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Productos ({cart.length})
              </h2>
              <div className="space-y-4 divide-y divide-gray-100">
                {cart.map((item: any) => (
                  <div key={`${item.id}-${item.variation_id ?? "base"}`} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600">📅 {item.deliveryDate}</p>
                      {item.deliveryDate && (
                        <p className="text-xs text-gray-500">
                          Cupos: <span className="font-semibold text-[#E985A7]">{getDailyRemaining(item.deliveryDate) ?? "N/D"}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right md:text-lg">
                      <p className="text-sm font-medium text-gray-600">× {item.quantity}</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-gray-900 text-right">
                  Total: ${cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              {preferenceId ? (
                <>
                  <Wallet initialization={{ preferenceId }} />
                  <button
                    onClick={handleCancelOrder}
                    disabled={loading}
                    className="w-full bg-white border-2 border-[#E985A7] text-[#E985A7] px-6 py-4 rounded-2xl font-semibold hover:bg-[#E985A7] hover:text-white shadow-lg hover:shadow-[#E985A7]/25 transition-all disabled:opacity-50 text-lg"
                  >
                    Cancelar y Modificar pedido
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#E985A7] text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-[#E985A7]/40 hover:bg-[#d96b8f] hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? "Generando orden..." : "Pagar con Mercado Pago"}
                </button>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-6 rounded-2xl text-center font-semibold mx-auto max-w-md ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-800 border-2 border-green-200"
              : "bg-yellow-100 text-yellow-800 border-2 border-yellow-200"
          }`}>
            {message}
          </div>
        )}
      </>
    )}
  </main>
);
}