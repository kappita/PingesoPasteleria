import { NextResponse } from "next/server";
import api from "@/app/lib/woocommerce";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data } = await api.post("orders", body);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Error creando orden:", err);
    return NextResponse.json({ error: "Error creando la orden" }, { status: 500 });
  }
}
