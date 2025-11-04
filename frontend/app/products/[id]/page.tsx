import api from "../../lib/woocommerce";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const { data: product } = await api.get(`products/${id}`);

  let variations: any[] = [];
  if (product.type === "variable") {
    const { data } = await api.get(`products/${id}/variations`);
    variations = data;
  }

  return (
    <main className="p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <ProductDetailsClient product={product} variations={variations} />
      </div>
    </main>
  );
}

