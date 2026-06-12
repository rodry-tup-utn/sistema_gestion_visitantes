import { useState } from "react";
import { toast } from "sonner";
import {
  useUsers,
  useSearchUsers,
  useCreateUser,
  useUpdateRole,
  useDeactivateUser,
  useReactivateUser,
  useResetPassword,
} from "../hooks/useUsers";
import UserForm from "../components/UserForm";
import type {
  CreateUserPayload,
  UpdateRolePayload,
} from "../../../../shared/types/user";
import PageHeader from "../../../../shared/components/PageHeader";
import Spinner from "../../../../shared/components/Spinner";
import Card from "../../../../shared/components/Card";
import Badge from "../../../../shared/components/Badge";
import EmptyState from "../../../../shared/components/EmptyState";
import Pagination from "../../../../shared/components/Pagination";
import SearchInput from "../../../../shared/components/SearchInput";
import { useAuth } from "../../../auth/context/useAuth";

export default function UsersList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 20;
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useUsers(page * limit, limit);
  const { data: searchData, isLoading: searchLoading } = useSearchUsers(
    search,
    page * limit,
    limit,
  );
  const createMutation = useCreateUser();
  const updateRoleMutation = useUpdateRole();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const resetPasswordMutation = useResetPassword();
  const [showForm, setShowForm] = useState(false);
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

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
    if (!window.confirm("¿Desactivar este usuario? No podrá iniciar sesión."))
      return;
    await deactivateMutation.mutateAsync(userId);
    toast.success("Usuario desactivado");
  }

  async function handleReactivate(userId: number) {
    await reactivateMutation.mutateAsync(userId);
    toast.success("Usuario reactivado");
  }

  function handleResetPassword(userId: number) {
    toast("Restablecer contraseña a 123456?", {
      action: {
        label: "Restablecer",
        onClick: async () => {
          try {
            await resetPasswordMutation.mutateAsync(userId);
            toast.success("Contraseña restablecida a 123456");
          } catch {
            toast.error("Error al restablecer la contraseña");
          }
        },
      },
      duration: 8000,
    });
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        actionLabel="Nuevo"
        onAction={() => setShowForm(true)}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre de usuario o email..."
            />
        </div>
        {isLoading || searchLoading ? (
          <Spinner />
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
        ) : list && list.data.length === 0 ? (
          <EmptyState
            label="usuarios"
            actionLabel="Crear primer usuario"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <>
            <div className="space-y-3">
              {list?.data
                .filter((u) => u.id != user?.id)
                .map((u) => (
                  <Card key={u.id}>
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
                        <Badge
                          variant={u.role === "ADMIN" ? "purple" : "primary"}
                        >
                          {u.role === "ADMIN" ? "Admin" : "Operador"}
                        </Badge>
                        <Badge variant={u.is_active ? "success" : "danger"}>
                          {u.is_active ? "Activo" : "Inactivo"}
                        </Badge>
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
                      <button
                        onClick={() => handleResetPassword(u.id)}
                        disabled={resetPasswordMutation.isPending}
                        className="rounded-md bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-200 disabled:opacity-50"
                      >
                        Reset Pass
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
                  </Card>
                ))}
            </div>
            <Pagination
              page={page}
              total={list?.total ?? 0}
              limit={limit}
              onPageChange={setPage}
              label="usuarios"
            />
          </>
        )}
      </div>
      {showForm && (
        <UserForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
    </>
  );
}
