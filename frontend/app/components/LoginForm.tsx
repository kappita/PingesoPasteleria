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
        let errorMessage = data.message || "Ocurrió un error inesperado.";

        if (res.status === 401) {
          errorMessage = data.message || "Las credenciales no son válidas.";
        } else if (res.status === 403) {
          errorMessage = data.message || "Debes verificar tu correo.";
        } else if (res.status >= 500) {
          errorMessage = "El servicio no está disponible. Reintenta en unos minutos.";
        }

        throw new Error(errorMessage);
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
