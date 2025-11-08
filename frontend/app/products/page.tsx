import api from "../lib/woocommerce";
import FiltersClient from "./FiltersClient";
import ProductGrid from "./ProductGrid";

export default async function ProductsPage(props: { searchParams: Promise<{ page?: string, category?: string, min_price?: string, max_price?: string }> }) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const perPage = 12;

  // Traer categorías desde WooCommerce
  const { data: categories } = await api.get("products/categories", { per_page: 50 });

  // Armar filtros según searchParams
  const params: any = { per_page: perPage, page: currentPage };
  if (searchParams.category) params.category = searchParams.category;
  if (searchParams.min_price) params.min_price = searchParams.min_price;
  if (searchParams.max_price) params.max_price = searchParams.max_price;

  const response = await api.get("products", params);
  const products = response.data;
  const totalPages = Number(response.headers["x-wp-totalpages"]);

  return (
    <main className="flex">
      {/* 🔹 Barra lateral de filtros */}
      <aside className="w-64 border-r p-6">
        <FiltersClient categories={categories} />
      </aside>

      {/* 🔹 Productos */}
      <section className="flex-1 p-6">
        <ProductGrid products={products} currentPage={currentPage} totalPages={totalPages} />
      </section>
    </main>
  );
}