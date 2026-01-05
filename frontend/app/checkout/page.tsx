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

    if(!form.first_name || !form.email || !form.address_1 || !form.city || !form.phone){
        setMessage("Completa todos los campos obligatorios");
        return;
    }

    if (deliveryType == 'delivery' && (!shippingForm.first_name || !shippingForm.last_name || !shippingForm.email || !shippingForm.address_1 || !shippingForm.city)) {
      setMessage("Completa todos los campos obligatorios")
      console.log(shippingForm)
      return;
    }

    try{
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
      let body:any = {
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
          ... body,
          shipping: shippingForm
        }
      }

      if (deliveryType === 'pickup') {
        body = {
          ...body,
          shipping_lines: [
                {"method_id": "local_pickup", "method_title": "Recogida (Local)", "total": "0.00", meta_data: [{"id": 1, "key":"pickup_address", "value":"Lo Errazuriz 879, Región Metropolitana de Santiago, 9201341 Santiago"},
                  {"id": 2, "key": "pickup_location", "value":"Local"}, {"id":3, "key": "Artículos", "value": article_descriptions}]}
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
            quantity: i.quantity
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
    <main className="p-8 w-[80%] flex flex-col">
      <h1 className="text-3xl font-bold mb-4">Finalizar compra</h1>
      {cart.length === 0 ? (
        <div className="text-center">
          <p>Tu carrito está vacío.</p>
          <Link href="/products" className="text-[#E985A7] underline">
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
                <input
                type="text"
                name="phone"
                placeholder="Número de celular o teléfono"
                value={form.phone}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                />
            </div>

            <h2 className="text-xl font-semibold mb-4">Tipo de entrega</h2>
            <div className="inline-flex gap-3">
              <button
                type="button"
                aria-pressed={deliveryType === "delivery"}
                onClick={() => setDeliveryType("delivery")}
                className={[
                  "h-18 w-40 rounded-none border font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-black/40",
                  deliveryType === "delivery"
                    ? "bg-[#E985A7] text-white"
                    : "bg-white text-black border-black/30 hover:bg-black/5",
                ].join(" ")}
              >
                🏍️ Envío a domicilio
              </button>

              <button
                type="button"
                aria-pressed={deliveryType === "pickup"}
                onClick={() => setDeliveryType("pickup")}
                className={[
                  "h-18 w-40 rounded-none border  font-medium transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-black/40",
                  deliveryType === "pickup"
                    ? "bg-[#E985A7] text-white "
                    : "bg-white text-black border-black/30 hover:bg-black/5",
                ].join(" ")}
              >
                🏠 Retiro en local
              </button>
            </div>
            <h2 className="text-xl font-semibold mb-4">Datos de envío</h2>
            {deliveryType === 'delivery' ? (
              <div className="space-y-3">
                <input
                type="text"
                name="first_name"
                placeholder="Nombre"
                value={shippingForm.first_name}
                onChange={handleShippingChange}
                className="border rounded p-2 w-full"
                />
                <input
                type="text"
                name="last_name"
                placeholder="Apellido"
                value={shippingForm.last_name}
                onChange={handleShippingChange}
                className="border rounded p-2 w-full"
                />
                <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={shippingForm.email}
                onChange={handleShippingChange}
                className="border rounded p-2 w-full"
                />
                <input
                type="text"
                name="address_1"
                placeholder="Dirección"
                value={shippingForm.address_1}
                onChange={handleShippingChange}
                className="border rounded p-2 w-full"
                />
                <input
                type="text"
                name="city"
                placeholder="Ciudad"
                value={shippingForm.city}
                onChange={handleShippingChange}
                className="border rounded p-2 w-full"
                />
            </div>
            ) : (
              <div className="mb-6 p-4 border rounded-lg bg-white">
                <p className="text-black">
                  Retiro de productos en Lo Errazuriz 879, Región Metropolitana de Santiago, 9201341 Santiago
                </p>
              </div>
            )}

          </div>
          <div>
            {loadingAvailability === true ? (
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
                  className="flex flex-col justify-between items-left border-b pb-2"
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

            {preferenceId ? (
              <div key={preferenceId} className="mt-6 border-t pt-6">
                <Wallet
                  initialization={{ preferenceId }}
                />
                <button
                    onClick={handleCancelOrder}
                    disabled={loading}
                    className="mt-6 bg-[#E985A7] shadow-md text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
                >
                  Cancelar y Modificar pedido
                </button>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-6 w-full bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
              >
                {loading ? "Generando orden..." : "Confirmar pedido"}
              </button>
            )}
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mt-6 text-center p-3 rounded ${message.startsWith("✅")
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
