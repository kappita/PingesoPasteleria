import { getProducts } from "./lib/woocommerce";

export default async function Home() {
  const products = await getProducts();
  return (
    <div>
      <main>
        <ul>
          {products.map((product: any) => (
            <li key={product.id} className="border p-2 m-2 rounded">
              <h2>{product.name}</h2>
              <p>Precio: ${product.price}</p>
              <a href={product.permalink} className="text-blue-600">
                Ver producto
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
