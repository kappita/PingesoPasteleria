"use client";

import { useState } from "react";
import Form from "next/form";
import { EyeIcon, EyeOffIcon } from "lucide-react";

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
    <div className="flex items-center justify-center mt-30">
      <Form
        onSubmit={() => setLoading(true)}
        action={handleSubmit}
        className="bg-white p-10 rounded-2xl w-100"
      >
        <h1 className="text-2xl font-bold text-center mb-8 text-purple-700">
          Registro de usuario
        </h1>

        <input
          type="text"
          placeholder="Nombre"
          name="firstName"
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          placeholder="Apellido"
          name="lastName"
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="text"
          placeholder="Usuario (no se puede cambiar)"
          name="username"
          required
          className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <input
          type="email"
          placeholder="Correo"
          name="email"
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
          {loading ? "Cargando..." : "Registrarse"}
        </button>
        {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
      </Form>
    </div>
  );
}
