"use client";
import { useCart } from "../context/CartContext";
import { getCookie } from 'cookies-next';
import { useDeliveryAvailability } from "../hooks/useDeliveryAvailability";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createHold, clearHold } from "../lib/wcpdd";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!); // Inicializa MercadoPago con la clave pública

type Fulfillment = "delivery" | "pickup";


interface DeliveryData {
  date: string;
  timestamp: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [deliveryCost, setDeliveryCost] = useState(null)

  const [ deliverySelection, setDeliverySelection ] = useState<DeliveryData | null>(null);

  useEffect(() => {
    (async () => {
      const cookieValue = getCookie('delivery_selection');
      const data = cookieValue ? JSON.parse(cookieValue as string) : null;
      setDeliverySelection(data)

      const res = await fetch("/api/store/cart", { cache: "no-store" });
      const storeCart = await res.json();
      setCart(storeCart);
      setTotal(storeCart.totals.total_items);
      handleSelectDeliveryType('pickup')
    })();
  }, []);


  const [deliveryType, setDeliveryType] = useState<Fulfillment>("pickup");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address_1: "",
    city: "",
    country: "CL",
    phone: "",
    postcode: "",
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };


  const updateAddress = async () => {
    let body:any = {
        billing_address: form,
        shipping_address: shippingForm,
        
    }

    if (deliveryType === 'pickup') {
      body.shipping_address = null
    }

    console.log(body)

    // body.shipping_address.address_1 = form.address_1,
    // body.shipping_address.city = form.city
    // body.shipping_address.country = form.country
    // body.shipping_address.first_name = form.first_name
    // body.shipping_address.last_name = form.last_name
    // body.shipping_address.postcode = form.postcode
    // body.shipping_address.state = 'CL-RM'



    console.log(`enviando: `, body)


    const res = await fetch("/api/store/cart/updateCustomer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
      
    })

    const newCart = await res.json();
    console.log(newCart)


  }

  const handleBlur = () => {
    if (form.postcode.length < 3 && shippingForm.postcode.length < 3) return;
    updateAddress()
  }

  const handleSelectDeliveryType = async (type: Fulfillment) => {
    const method_id = type === 'pickup' ? 'pickup_location' : 'flat_rate'

    if (!cart) return;

    console.log(cart)

    const selectedRate = cart.shipping_rates[0].shipping_rates.find((rate:any) => rate.method_id == method_id)
    console.log(selectedRate)

    const body = {
      package_id: cart.shipping_rates[0].package_id,
      rate_id: selectedRate.rate_id
    }
    console.log('metodo seleccionado', body)
    const res = await fetch("/api/store/cart/selectShippingRate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    const newCart = await res.json()
    setCart(newCart)

  }


  const handleDeliveryType = async (type: Fulfillment) => {
    if (type === 'pickup') {
      setDeliveryType('pickup')
      handleSelectDeliveryType('pickup')
    } else {
      setDeliveryType('delivery')
      handleSelectDeliveryType('delivery')
    }
  }


  if (!cart) return <p>Cargando carrito...</p>;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage("El carrito esta vacío");
      return;
    }

    if (!form.first_name || !form.email || !form.address_1 || !form.city || !form.phone || !form.postcode) {
      setMessage("Completa todos los campos obligatorios");
      return;
    }

    // if (deliveryType == 'delivery' && (!shippingForm.first_name || !shippingForm.last_name || !shippingForm.email || !shippingForm.address_1 || !shippingForm.city || !shippingForm.postcode)) {
    //   setMessage("Completa todos los campos obligatorios")
    //   console.log(shippingForm)
    //   return;
    // }

    try {
      setLoading(true);
      setMessage(null);


      let body:any = {
        billing_address: form,
        shipping_address: shippingForm,
        payment_method: "transbank_webpay_plus_rest",
        meta_data: [
          {
            key: "Delivery Date",
            value: deliverySelection?.date
          },
          {
            key: "_orddd_lite_timestamp",
            value: deliverySelection?.timestamp
          }
        ],
      }
      body.shipping_address = form;

      console.log(body)



    
      const orderResponse = await fetch("/api/store/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });


      if (!orderResponse.ok) throw new Error("Error al crear la orden en WP");
      const orderData = await orderResponse.json();

      window.location.href = orderData.payment_result.redirect_url;

      //clearCart();
      setMessage(`✅ Pedido #${orderData.id} creado correctamente.`);
    }
    catch (err: any) {
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
                  onBlur={handleBlur}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="last_name" placeholder="Apellido"
                  value={form.last_name} onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="email" name="email" placeholder="Correo electrónico"
                  value={form.email} onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="address_1" placeholder="Dirección"
                  value={form.address_1} onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="city" placeholder="Ciudad"
                  value={form.city} onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="text" name="postcode" placeholder="Código postal"
                  value={form.postcode} onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 focus:border-transparent shadow-sm transition-all"
                />
                <input
                  type="tel" name="phone" placeholder="Número de celular o teléfono *"
                  value={form.phone} onChange={handleChange}
                  onBlur={handleBlur}
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
                  type="button" onClick={() => handleDeliveryType("delivery")}
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
                  type="button" onClick={() => handleDeliveryType("pickup")}
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
                  {['Nombre', 'Apellido', 'email', 'Dirección', 'Ciudad', 'Código Postal'].map((field) => (
                    <input
                      key={field}
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      placeholder={field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      value={shippingForm[field as keyof typeof shippingForm] as string}
                      onChange={handleShippingChange}
                      onBlur={handleBlur}
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
              {!!deliverySelection ? 
              (<h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Fecha de entrega: {deliverySelection.date}
              </h2>) : (<div></div>)
              }

              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Productos ({cart.items.length})
              </h2>
              <div className="space-y-4 divide-y divide-gray-100">
                {cart && cart.items.map((item: any) => (
                  <div key={`${item.id}-${item.variation_id ?? "base"}`} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{item.name}</p>
                      {
                        item.variation.map((x: any) => (
                          <p className="text-xs text-gray-500">
                          <span className="font-semibold text-[#E985A7]">{`${x.attribute} - ${x.value}`}</span>
                        </p>
                        ))
                      }
                    </div>
                    <div className="text-right md:text-lg">
                      <p className="text-sm font-medium text-gray-600">× {item.quantity}</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">${(item.totals.line_subtotal)}</p>
                    </div>
                  </div>
                ))}
                {
                  cart.totals.total_shipping > 0 ? (
                    <div className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <p className="font-semibold text-gray-900 text-lg">Envío</p>
                      <p className="text-right text-xl md:text-2xl font-bold text-gray-900">${cart.totals.total_shipping}</p>
                    </div>
                  ) : (<div></div>)
                }
                
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-2xl font-bold text-gray-900 text-right">
                  Total: ${cart.totals.total_price}
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <button
                  onClick={handleCheckout}
                  className="w-full bg-[#E985A7] text-white px-6 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-[#E985A7]/40 hover:bg-[#d96b8f] hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {loading ? "Generando orden..." : "Pagar con Webpay"}
                </button>
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