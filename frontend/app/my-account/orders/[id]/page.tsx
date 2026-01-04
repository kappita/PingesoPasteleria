"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export type Order = {
  orderNumber: string;
  date: string;
  status: string;
  total: string;
  subtotal: string;
  shippingTotal: string;
  paymentMethodTitle: string;
  customerNote: string | null;

  lineItems: {
    nodes: OrderLineItem[];
  };

  billing: BillingAddress;

  shipping: ShippingAddress;
};

export type OrderLineItem = {
  product: {
    node: {
      date: string;
      name: string;
    };
  };
  quantity: number;
  total: string;
  metaData: {
    key: string;
    value: string;
  }[];
};

export type BillingAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  state: string;
  postcode: string | null;
  phone: string;
  email: string;
};

export type ShippingAddress = {
  address1: string;
  address2: string | null;
  city: string;
  company: string | null;
  country: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  postcode: string | null;
  email: string | null;
};

export default function OrderDetail() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);

      try {
        const data = await fetch(`/api/order?id=${params.id}`);
        const { order } = await data.json();
        setOrder(order);
      } catch (err: any) {
        setError(err.message || "Error al cargar la orden");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id]);

  if (loading) return <p className="p-10">Cargando orden...</p>;
  if (error) return <p className="p-10 text-red-600">{error}</p>;
  if (!order) return <p className="p-10">Orden no encontrada.</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Pedido #{order.orderNumber}
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <p>
          <strong>Fecha:</strong> {order.date}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <span
            className={`${order.status === "COMPLETED"
                ? "text-green-600"
                : order.status === "CANCELLED"
                  ? "text-red-600"
                  : "text-yellow-600"
              } font-semibold`}
          >
            {order.status}
          </span>
        </p>

        <p>
          <strong>Subtotal:</strong> {order.subtotal}
        </p>

        <p>
          <strong>Envío:</strong> {order.shippingTotal}
        </p>

        <p>
          <strong>Total:</strong> {order.total}
        </p>

        <p>
          <strong>Método de pago:</strong> {order.paymentMethodTitle}
        </p>

        {order.customerNote && (
          <p>
            <strong>Nota del cliente:</strong> {order.customerNote}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-purple-600">
            Dirección de facturación
          </h2>
          <p>
            {order.billing.firstName} {order.billing.lastName}
          </p>
          <p>{order.billing.address1}</p>
          <p>{order.billing.city}</p>
          <p>{order.billing.state}</p>
          <p>{order.billing.postcode}</p>
          <p>{order.billing.phone}</p>
          <p>{order.billing.email}</p>
        </div>

        {/* Dirección de envío */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-purple-600">
            Dirección de envío
          </h2>
          <p>
            {order.shipping.firstName} {order.shipping.lastName}
          </p>
          <p>{order.shipping.address1}</p>
          {order.shipping.address2 && <p>{order.shipping.address2}</p>}
          <p>{order.shipping.city}</p>
          <p>{order.shipping.state}</p>
          <p>{order.shipping.postcode}</p>
          <p>{order.shipping.phone}</p>
        </div>
      </div>

      {/* Productos */}
      <h2 className="text-2xl font-semibold mb-4">Productos</h2>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-purple-600 text-white">
          <tr>
            <th className="px-6 py-3 text-left">Producto</th>
            <th className="px-6 py-3 text-left">Cantidad</th>
            <th className="px-6 py-3 text-left">Fecha entrega</th>
            <th className="px-6 py-3 text-left">Total</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {order.lineItems.nodes.map((item, i) => {
            const cantidad = item.metaData.find(
              (m) => m.key === "cantidad"
            )?.value;
            const fechaEntrega = item.metaData.find(
              (m) => m.key === "Fecha de entrega"
            )?.value;

            return (
              <tr key={i} className="hover:bg-gray-100">
                <td className="px-6 py-4">{item.product.node.name}</td>
                <td className="px-6 py-4">{cantidad}</td>
                <td className="px-6 py-4">{fechaEntrega}</td>
                <td className="px-6 py-4">${item.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
