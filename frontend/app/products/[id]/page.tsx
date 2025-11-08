import api from "@/app/lib/woocommerce";
import ProductDetailsClient from "./ProductDetailsClient";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: product } = await api.get(`products/${id}`);

  const { data: variations } =
    product.type === "variable"
      ? await api.get(`products/${id}/variations`)
      : { data: [] };

  return (
    <main className="p-8">
      <ProductDetailsClient product={product} variations={variations} />
    </main>
  );
}

