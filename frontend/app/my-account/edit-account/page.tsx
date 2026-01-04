"use client";

import Form from "next/form";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { set } from "date-fns";

export default function EditAccountPage() {
  const [user, setUser] = useState<{
    username: String;
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

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

  async function handleSubmit(formData: FormData) {
    setMessage("");
    setLoading(true);

    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const actualPass = formData.get("actualPass")?.toString().trim();
    const newPass = formData.get("newPass")?.toString().trim();
    const newPass2 = formData.get("newPass2")?.toString().trim();

    // Validaciones
    if (newPass || newPass2) {
      if (!actualPass) {
        setMessage("Debes ingresar tu contraseña actual para cambiarla.");
        setLoading(false);
        return;
      }
      if (newPass !== newPass2) {
        setMessage("Las contraseñas nuevas no coinciden.");
        setLoading(false);
        return;
      }
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|:;"'<>,.?/]).{8,}$/;

      if (!passwordRegex.test(newPass!)) {
        setMessage(
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
        );
        setLoading(false);
        return;
      }
    }

    if (actualPass) {
      setMessage(
        "Si solo quieres cambiar otros datos, deja en blanco el campo de la contraseña actual."
      );
      setLoading(false);
      return;
    }

    // Construir payload
    const payload: any = {};
    payload.username = user?.username;
    if (firstName && firstName !== user?.firstName)
      payload.firstName = firstName;
    if (lastName && lastName !== user?.lastName) payload.lastName = lastName;
    if (email && email !== user?.email) payload.email = email;
    if (newPass) {
      payload.newPass = newPass;
      payload.password = actualPass;
    }

    if (Object.keys(payload).length === 0) {
      setMessage("No hiciste ningún cambio.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar los datos.");
      }

      setMessage("Datos actualizados correctamente");
      window.location.reload();
    } catch (err: any) {
      setMessage(err.message || "Error al actualizar el usuario.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form action={handleSubmit} className="flex flex-col ml-10 text-center">
      <p className="mb-5">
        Nombre de usuario: {user?.username} (no se puede cambiar)
      </p>
      <p>Nombre</p>
      <input
        type="text"
        name="firstName"
        defaultValue={user?.firstName}
        required
        className="w-1rem bg-white mb-5 text-center"
      />

      <p>Apellido</p>
      <input
        type="text"
        name="lastName"
        defaultValue={user?.lastName}
        required
        className="w-1rem bg-white mb-5 text-center"
      />

      <p>Correo electronico</p>
      <input
        type="email"
        name="email"
        defaultValue={user?.email}
        required
        className="w-1rem bg-white mb-5 text-center"
      />

      <div className="flex flex-col mb-5 border-2 rounded-lg p-3">
        <h2>Cambiar contraseña</h2>
        <p>Contraseña actual (déjalo en blanco para no cambiarla)</p>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            name="actualPass"
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

        <p>Nueva contraseña (déjalo en blanco para no cambiarla)</p>
        <div className="relative">
          <input
            type={showPassword2 ? "text" : "password"}
            placeholder="Contraseña"
            name="newPass"
            className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword2(!showPassword2)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-4 text-gray-500"
          >
            {showPassword2 ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
          </button>
        </div>

        <p>Confirmar nueva contraseña (déjalo en blanco para no cambiarla)</p>
        <div className="relative">
          <input
            type={showPassword3 ? "text" : "password"}
            placeholder="Contraseña"
            name="newPass2"
            className="w-full mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword3(!showPassword3)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-4 text-gray-500"
          >
            {showPassword3 ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="bg-purple-400 rounded-full cursor-pointer p-2"
      >
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </Form>
  );
}
