const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
const WP_URL = "https://tortascondiseno.infinityfreeapp.com/wp-json/wc/v3";

async function wooFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${WP_URL}/${endpoint}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: { revalidate: 60 }, // cache por 1 minuto (Next.js)
  });

  if (!res.ok) {
    console.error(
      `❌ Error en WooCommerce API: ${res.status} ${res.statusText}`
    );
    throw new Error(`Error en WooCommerce: ${res.status}`);
  }

  return res.json();
}

export async function getProducts() {
  return wooFetch("products");
}
