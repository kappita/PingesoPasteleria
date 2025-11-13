import { cookies } from "next/headers";
import { getCustomerOrders } from "@/app/lib/graphql/queries/getCustomerOrders";
import { redirect } from "next/navigation";
import { getViewer } from "@/app/lib/graphql/queries/getViewer";
import Link from "next/link";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const user = await getViewer(token);
    const email = user?.email;

    const ordersData = await getCustomerOrders(token, email, 10);
    const orders = ordersData?.nodes ?? [];
    return (
      <main>
        <h1 className="font-bold text-center mb-5 text-[1.4rem]">
          Mis pedidos
        </h1>

        <table className="border-2">
          <thead className="border-b-1">
            <tr className="uppercase">
              <th className="py-2 px-4">Pedido</th>
              <th className="py-2 px-4">Fecha</th>
              <th className="py-2 px-4">Estado</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No se encontraron pedidos.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.databaseId} className="text-center">
                  <td className="py-2 px-4">#{order.databaseId}</td>
                  <td className="py-2 px-4">
                    {new Date(order.date).toLocaleDateString("es-ES")}
                  </td>
                  <td className="py-2 px-4">{order.status}</td>
                  <td className="py-2 px-4">{order.total}</td>
                  <td className="py-2 px-4">
                    <Link
                      href={`/my-account/orders/${order.databaseId}`}
                      className="text-blue-600 underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    );
  } catch (err) {
    return (
      <main>
        <h1 className="font-bold text-center mb-5 text-[1.4rem]">
          Mis pedidos
        </h1>
        <p className="text-red-600">
          No se pudieron cargar los pedidos. Por favor intentalo más tarde.
        </p>
      </main>
    );
  }
}
