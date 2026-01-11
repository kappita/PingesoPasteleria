"use client";

import { useState } from "react";
import Form from "next/form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // Validar la complejidad de la contraseña
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setMessage(
        "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Cuenta creada correctamente. Bienvenido ${data.user.name}`);
        window.location.href = "/";
      } else {
        if (data.message === "fetch failed") {
          setMessage(
            "Error en el servidor. Por favor, inténtalo de nuevo más tarde."
          );
        } else {
          console.log(data.message);
          setMessage(data.message || "Error al registrar el usuario.");
        }
      }
    } catch (error: any) {
      setMessage(error || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:w-[600px]">
      {/* Título */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#E985A7] leading-tight">
          Regístrate
        </h1>
      </div>

      {/* Formulario */}
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl sm:rounded-3xl border border-pink-100/50 p-6 sm:p-8 lg:p-12">
        <Form action={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
          
          {/* Nombre */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 pl-1">
              Nombre
            </label>
            <input
              type="text"
              name="firstName"
              required
              placeholder="Nombre"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#E985A7] focus:ring-2 focus:ring-[#E985A7]/30 transition-all duration-300 rounded-2xl shadow-md hover:shadow-lg"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 pl-1">
              Apellido
            </label>
            <input
              type="text"
              name="lastName"
              required
              placeholder="Apellido"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#E985A7] focus:ring-2 focus:ring-[#E985A7]/30 transition-all duration-300 rounded-2xl shadow-md hover:shadow-lg"
            />
          </div>

          {/* Usuario */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 pl-1">
              Usuario <span className="text-xs sm:text-sm text-gray-500 font-normal">(no se puede cambiar)</span>
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="Usuario"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#E985A7] focus:ring-2 focus:ring-[#E985A7]/30 transition-all duration-300 rounded-2xl shadow-md hover:shadow-lg"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 pl-1">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@correo.com"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-gray-300 hover:border-gray-400 focus:outline-none focus:border-[#E985A7] focus:ring-2 focus:ring-[#E985A7]/30 transition-all duration-300 rounded-2xl shadow-md hover:shadow-lg"
            />
          </div>

          {/* Mensaje error */}
          {message && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm text-center mx-auto max-w-full">
              {message}
            </div>
          )}

          {/* Botón submit */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6  md:-translate-y-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#E985A7] hover:bg-[#D6779C] text-white py-3 sm:py-4 px-6 lg:px-8 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E985A7]/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base lg:text-lg min-h-[48px]"
            >
              {loading ? "Cargando..." : "Registrarse"}
            </button>
            <Link
              href="/login"
              type="button"
              className="flex-1 bg-[#FFC05B] hover:bg-[#E6A943] text-white py-3 sm:py-4 px-6 lg:px-8 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 text-center focus:ring-[#FFC05B]/50 font-semibold text-sm sm:text-base lg:text-lg min-h-[48px]"
            >
              Inicia sesión
            </Link>
          </div>
        </Form>
      </div>
    </div>
  </div>
);
}