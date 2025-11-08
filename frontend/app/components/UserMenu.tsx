"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/viewer");
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
      <FaRegUserCircle size={25} className="cursor-pointer" />

      {open && (
        <div className="absolute right-0 mt-2 bg-white border-3 rounded-xl p-2 text-sm">
          {user ? (
            <>
              <p className="font-semibold text-gray-700">
                ¡Bienvenido!, {user.name}
              </p>
              <button
                onClick={handleLogout}
                className="mt-2 text-red-600 hover:underline"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-blue-600 hover:underline whitespace-nowrap p-2"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
