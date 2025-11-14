"use client";
import { useRouter } from 'next/navigation';
import { useCart } from "../../context/CartContext";
import DeliveryDatePicker from "../../components/DeliveryDatePicker";
import { useState, useEffect } from "react";
import { useDeliveryAvailability } from "../../hooks/useDeliveryAvailability";


interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: 'simple' | 'grouped' | 'external' | 'variable';
  status: 'draft' | 'pending' | 'private' | 'publish';
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: any[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: 'taxable' | 'shipping' | 'none';
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: Dimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: ProductCategory[];
  tags: ProductTag[];
  images: ProductImage[];
  attributes: any[];
  default_attributes: any[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: any[];
}

interface ProductImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

interface Dimensions {
  length: string;
  width: string;
  height: string;
}

type bruh = {
  product: Product,
  variations: any
}


export default function ProductDetailsClient({ product, variations }: bruh) {
  const [selectedAttrs, setSelectedAttrs] = useState<{ [key: string]: string }>({});
  const [currentVariation, setCurrentVariation] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const { data, getDailyRemaining, refresh } = useDeliveryAvailability();
  const { addToCart } = useCart();
  const router = useRouter();


  useEffect(() => {
    if (deliveryDate) refresh();
  }, [deliveryDate]);

  // Actualiza la variación actual cuando cambian los selects
  useEffect(() => {
    if (product.type !== "variable") return;

    const match = variations.find((v: any) =>
      v.attributes.every(
        (a: any) =>
          selectedAttrs[a.name] &&
          selectedAttrs[a.name].toLowerCase() === a.option.toLowerCase()
      )
    );

    setCurrentVariation(match || null);
  }, [selectedAttrs, variations, product.type]);

  // Manejador genérico para cada atributo (ej: Tamaño, Sabor)
  const handleSelectChange = (attrName: string, value: string) => {
    setSelectedAttrs((prev) => ({
      ...prev,
      [attrName]: value,
    }));
  };

  // Precio actual
  const currentPrice =
    currentVariation?.price || product.price || "N/A";

  // Agregar al carrito
  const handleAddToCart = () => {
    if (product.type === "variable" && !currentVariation) {
      setMessage("⚠️ Debes seleccionar todas las opciones antes de agregar al carrito.");
      return false;
    }

    if (quantity < 1) {
      setMessage("⚠️ La cantidad debe ser al menos 1.");
      return false;
    }

    const item = currentVariation || product;

    addToCart({
      id: item.id,
      name: product.name,
      price: parseFloat(item.price),
      quantity,
      image: item.image?.src || product.images[0]?.src,
      attributes: selectedAttrs,
      deliveryDate: deliveryDate,
    });

    setMessage("✅ Producto añadido al carrito!");
    return true
  };

  const handleBuyNow = () => {
    const res = handleAddToCart()
    if (res) {
      router.push('/cart')
    }
    
  }

  return (
    <div className="w-[85vw] mx-auto">
      {/* TODO: IMPLEMENTAR BREADCRUMBS PARA MANEJO DE CATEGORÍAS */}
      <p className="mb-4">{`Productos > ${product.categories[0].name} > ${product.name}`}</p>
      <div className="grid grid-cols-2">
        <img
          src={currentVariation?.image?.src || product.images[0]?.src}
          alt={product.name}
          className="w-full h-96 mb-6 object-cover"
        />
        <div className="w-full px-16">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Mostrar precio */}
          <p className="text-2xl font-semibold mb-6">
            ${ (parseFloat(currentPrice) * quantity).toFixed(2) }
          </p>


          <p className="text-gray-700 mb-4">
            {product.description.replace(/<[^>]+>/g, "")}
          </p>

          {/* Si es producto variable, mostrar selects dinámicos */}
          {product.type === "variable" &&
            product.attributes.map((attr: any) => (
              <div key={attr.name} className="mb-4">
                <label className="block mb-2 text-lg font-medium">
                  Selecciona {attr.name.toLowerCase()}:
                </label>
                <select
                  onChange={(e) => handleSelectChange(attr.name, e.target.value)}
                  value={selectedAttrs[attr.name] || ""}
                  className="border p-3 w-full max-w-sm"
                >
                  <option value="">Selecciona una opción</option>
                  {attr.options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          {/* Seleccionar cantidad */}
          <div className="mb-4 flex items-center gap-3">
            <label htmlFor="quantity" className="text-lg font-medium">
              Cantidad:
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded-lg p-2 w-20 text-center"
            />
          </div>
          {/* TODO: AGREGAR SELECCION DE FECHA */}

      <div className="flex w-[70%] items-stretch justify-between">
      {/* Botón agregar al carrito */}
      <button
        onClick={handleAddToCart}
        className="bg-transparent border-[#E985A7] border-2 text-[#E985A7] px-6 py-3 rounded-full w-[40%]"
      >
        {(!deliveryDate ||
          (getDailyRemaining(deliveryDate) ?? 0) <= 0 ||
          (data?.global_remaining ?? 0) <= 0)
          ? "No disponible"
          : "Agregar al carrito"}
      </button>
      <button
        onClick={handleBuyNow}
        className="bg-[#E985A7] rounded-full text-white px-6 py-3  hover:bg-pink-600 w-[40%]"
      >
        Comprar ahora
      </button>


      </div>
      {/* Mensaje de confirmación */}
      {message && (
        <div
          className={`mt-4 text-center p-3 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {message}
        </div>
      )}


        </div>

      </div>




    </div>
  );
}
