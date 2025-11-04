import { NextResponse } from "next/server";
import api from "@/app/lib/woocommerce";

export async function GET() {
  try {
    // Traer todos los productos paginados (hasta 100 por página)
    const allProducts: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data } = await api.get("products", { per_page: 100, page });
      allProducts.push(...data);
      if (data.length < 100) hasMore = false;
      page++;
    }

    return NextResponse.json(allProducts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
