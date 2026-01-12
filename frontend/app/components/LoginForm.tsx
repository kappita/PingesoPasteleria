"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    setLoading(true);
    setMessage("");

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
  <div className="min-h-screen flex items-center justify-center py-8 sm:py-8 px-4 sm:px-6 lg:px-8 ">
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:w-[600px]">
      {/* Título */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#E985A7] leading-tight">
          Ingresa a tu cuenta
        </h1>
      </div>

      {/* Formulario */}
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl border border-pink-100/50 p-6 sm:p-8 lg:p-12">
        <Form action={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
          
          {/* Usuario */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 pl-1">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="Nombre de usuario"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-pink-200/50 rounded-2xl focus:outline-none focus:border-[#E985A7] focus:ring-2 focus:ring-[#E985A7]/30 transition-all duration-300 shadow-md hover:shadow-lg"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 pl-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="contraseña"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 pr-12 border-2 border-pink-200/50 rounded-2xl focus:outline-none focus:border-[#E985A7] focus:ring-2 focus:ring-[#E985A7]/30 transition-all duration-300 shadow-md hover:shadow-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showPassword ? <EyeOffIcon size={18} className="sm:w-5 sm:h-5" /> : <EyeIcon size={18} className="sm:w-5 sm:h-5" />}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-center text-gray-400 font-medium hover:underline cursor-pointer transition-colors text-right">
              ¿Has olvidado contraseña?
            </p>
          </div>

          {/* Mensaje error */}
          {message && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm text-center">
              {message}
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6  md:-translate-y-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#E985A7] hover:bg-[#D6779C] text-white py-3 sm:py-4 px-6 lg:px-8 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base lg:text-lg min-h-[48px]"
            >
              {loading ? "Cargando..." : "Ingresar"}
            </button>
            <Link
              href="/register"
              type="button"
              className="flex-1 bg-[#FFC05B] hover:bg-[#E6A943] text-white py-3 sm:py-4 px-6 lg:px-8 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 text-center focus:ring-[#FFC05B]/50 font-semibold text-sm sm:text-base lg:text-lg min-h-[48px]"
            >
              Registrarse
            </Link>
          </div>
        </Form>
      </div>
    </div>
  </div>
);
}