// components/CartItemRow.tsx
"use client";

// Importamos el tipo que acabamos de exportar en el Paso 1
import { CartItem } from "../context/CartContext"; 

interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
  // Recibimos la función y el dato global desde el padre
  getDailyRemaining: (date: string) => number | null; 
  globalRemaining: number;
}

export default function CartItemRow({
  item,
  updateQuantity,
  removeFromCart,
  getDailyRemaining,
  globalRemaining,
}: CartItemRowProps) {
  
  // 1. Calcular límites
  const dailyLimit = item.deliveryDate ? (getDailyRemaining(item.deliveryDate) ?? 0) : 0;
  
  // El límite es el menor entre el cupo del día y el stock global
  const maxQuantityAvailable = Math.min(dailyLimit, globalRemaining);

  // 2. ¿Hemos llegado al tope?
  const isMaxReached = item.quantity >= maxQuantityAvailable;

  return (
    <li className="flex items-center justify-between border rounded-xl p-4 shadow-sm bg-white">
      <div className="flex items-center gap-4">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
        )}
        <div>
          <h2 className="font-semibold">{item.name}</h2>
          <p className="text-gray-600">${item.price}</p>
          <p className="text-sm text-gray-500">
            Entrega: <span className="font-medium text-pink-600">{item.deliveryDate}</span>
          </p>
          
          {/* Alerta de stock bajo */}
          {maxQuantityAvailable > 0 && maxQuantityAvailable < 5 && (
             <p className="text-xs text-orange-500 font-bold mt-1">
               ¡Quedan {maxQuantityAvailable} cupos!
             </p>
          )}
           {maxQuantityAvailable <= 0 && (
             <p className="text-xs text-red-500 font-bold mt-1">
               Sin cupo disponible
             </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Botón RESTAR */}
        <button
          onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
        >
          −
        </button>

        <span className="font-medium w-6 text-center">{item.quantity}</span>

        {/* Botón SUMAR (Con lógica de bloqueo) */}
        <button
          onClick={() => {
            if (!isMaxReached) updateQuantity(item.id, item.quantity + 1);
          }}
          disabled={isMaxReached || maxQuantityAvailable <= 0}
          className={`w-8 h-8 flex items-center justify-center border rounded ${
            isMaxReached || maxQuantityAvailable <= 0
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "hover:bg-pink-50 text-pink-600 border-pink-200"
          }`}
        >
          +
        </button>
      </div>

      <div className="text-right">
        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 hover:underline text-sm mt-1"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}