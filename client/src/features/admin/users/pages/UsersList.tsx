import { useState } from "react";
import { toast } from "sonner";
import {
  useUsers,
  useCreateUser,
  useUpdateRole,
  useDeactivateUser,
  useReactivateUser,
} from "../hooks/useUsers";
import UserForm from "../components/UserForm";
import type {
  CreateUserPayload,
  UpdateRolePayload,
} from "../../../../shared/types/user";

export default function UsersList() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, isError, error } = useUsers(page * limit, limit);
  const createMutation = useCreateUser();
  const updateRoleMutation = useUpdateRole();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(data: CreateUserPayload) {
    await createMutation.mutateAsync(data);
    setShowForm(false);
    toast.success("Usuario creado correctamente");
  }

  async function handleRoleChange(userId: number, currentRole: string) {
    const newRole: UpdateRolePayload["role"] =
      currentRole === "ADMIN" ? "OPERATOR" : "ADMIN";
    await updateRoleMutation.mutateAsync({ userId, data: { role: newRole } });
    toast.success("Rol actualizado");
  }

  async function handleDeactivate(userId: number) {
    toast("¿Desactivar este usuario? No podrá iniciar sesión.", {
      duration: Infinity,
      action: {
        label: "Confirmar",
        onClick: async () => await deactivateMutation.mutateAsync(userId),
      },
      cancel: {
        label: "Cancel",
        onClick: () => toast.info("Accion cancelada"),
      },
    });
  }

  async function handleReactivate(userId: number) {
    await reactivateMutation.mutateAsync(userId);
    toast.success("Usuario reactivado");
  }

  return (
    <>
      <div className="flex items-center justify-around mt-2 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Usuarios</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
        >
          + Nuevo
        </button>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">
              {error instanceof Error
                ? error.message
                : "Error al cargar usuarios"}
            </p>
            <button
              onClick={() => setPage(0)}
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
            >
              Reintentar
            </button>
          </div>
        ) : data && data.data.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">No hay usuarios registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Crear primer usuario
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {data?.data.map((u) => (
                <div key={u.id} className="rounded-xl bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {u.name} {u.lastname}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {u.role === "ADMIN" ? "Admin" : "Operador"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleRoleChange(u.id, u.role)}
                      disabled={updateRoleMutation.isPending}
                      className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      {u.role === "ADMIN" ? "Hacer Operador" : "Hacer Admin"}
                    </button>
                    {u.is_active ? (
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        disabled={deactivateMutation.isPending}
                        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-200 disabled:opacity-50"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(u.id)}
                        disabled={reactivateMutation.isPending}
                        className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-600 transition hover:bg-green-200 disabled:opacity-50"
                      >
                        Reactivar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data && data.total > limit && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span>
                  Página {page + 1} · {data.total} usuarios
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm transition hover:bg-gray-50 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
    </>
  );
}
