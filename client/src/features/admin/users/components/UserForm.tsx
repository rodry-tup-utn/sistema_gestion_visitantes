import { useState, type FormEvent } from "react";
import type { CreateUserPayload } from "../../../../shared/types/user";

interface Props {
  onSubmit: (data: CreateUserPayload) => Promise<void>;
  onCancel: () => void;
}

export default function UserForm({ onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CreateUserPayload>({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "OPERATOR",
  });
  const [error, setError] = useState("");
  const [showPass, setShowpass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.lastname || !form.email || !form.password) {
      setError("Completá todos los campos");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      setError("Error al crear el usuario");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Nuevo Usuario</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3 ">
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Nombre
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Apellido
              </label>
              <input
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">
              Contraseña
            </label>
            <input
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:cursor-pointer hover:bg-cyan-700 disabled:opacity-60"
            onClick={(e) => {
              e.preventDefault();
              setShowpass(!showPass);
            }}
          >
            Mostrar Contraseña
          </button>

          <div>
            <label className="block text-xs font-medium text-gray-600">
              Rol
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-60 hover:cursor-pointer"
            >
              {submitting ? "Creando…" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
