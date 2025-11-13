"use client";

import { useState } from "react";
import Form from "next/form";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message === "fetch failed") {
          throw new Error(
            "Error en el servidor. Por favor, inténtalo de nuevo más tarde."
          );
        } else {
          throw new Error(data?.message || "Contraseña o usuario inválido.");
        }
      }

      window.location.href = "/";
    } catch (error: any) {
      setMessage(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center mt-30">
      <Form
        onSubmit={() => setLoading(true)}
        action={handleSubmit}
        className="bg-white p-10 rounded-2xl w-100"
      >
        <h1 className="text-2xl font-bold text-center mb-8 text-purple-700">
          Iniciar sesión
        </h1>

        <input
          type="text"
          placeholder="Usuario"
          name="username"
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="relative w-full mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            name="password"
            required
            className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-4 text-gray-500"
          >
            {showPassword ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 cursor-pointer"
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>
        {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
      </Form>
    </div>
  );
}
