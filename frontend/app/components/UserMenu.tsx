"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/viewer");
        if (res.status === 401) {
          router.replace("/login");
        }
        if (!res.ok) return;
        const data = await res.json();
        setUser(data.viewer);
      } catch {
        // No hay sesión o error
      }
    }
    fetchUser();
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="relative" onClick={() => setOpen(!open)}>
      <FaRegUserCircle className="h-8 w-8 cursor-pointer" />

      {open && (
        <div className="absolute right-0 mt-2 bg-white border-3 rounded-xl p-2 text-sm min-w-50">
          {user ? (
            <div className="flex flex-col">
              <p className="text-center font-semibold text-gray-700">
                ¡Bienvenido!, {user.firstName} {user.lastName}
              </p>

              <Link
                href="/my-account/orders"
                className="text-center mt-2 hover:underline"
              >
                Mi cuenta
              </Link>

              <button
                onClick={handleLogout}
                className="text-center mt-2 text-red-600 hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <nav className="flex flex-col">
              <Link
                href="/login"
                className="text-center hover:bg-blue-500 whitespace-nowrap p-3 border border-black rounded-full bg-blue-300 mb-3"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="text-center hover:bg-blue-500 whitespace-nowrap p-3 border border-black rounded-full bg-blue-300"
              >
                Registrarse
              </Link>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
