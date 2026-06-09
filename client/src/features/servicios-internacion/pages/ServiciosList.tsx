import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/AuthContext";
import {
  useServicios,
  useSearchServicios,
  useCreateServicio,
  useUpdateServicio,
} from "../hooks/useServiciosInternacion";
import ServicioForm from "../components/ServicioForm";
import type {
  CreateServicioInternacionPayload,
  ServicioInternacion,
} from "../../../shared/types/internacion";
import PageHeader from "../../../shared/components/PageHeader";
import SearchInput from "../../../shared/components/SearchInput";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";
import Card from "../../../shared/components/Card";
import EditButton from "../../../shared/components/EditButton";
import Pagination from "../../../shared/components/Pagination";

export default function ServiciosList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] =
    useState<ServicioInternacion | null>(null);
  const limit = 20;
  const { data, isLoading } = useServicios(page * limit, limit);
  const { data: searchData, isLoading: searchLoading } = useSearchServicios(
    search,
    page * limit,
    limit,
  );
  const createMutation = useCreateServicio();
  const updateMutation = useUpdateServicio();
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  useEffect(() => {
    setPage(0);
  }, [search]);

  async function handleCreate(data: CreateServicioInternacionPayload) {
    await createMutation.mutateAsync(data);
    setShowForm(false);
    toast.success("Servicio creado");
  }

  async function handleUpdate(data: CreateServicioInternacionPayload) {
    await updateMutation.mutateAsync({ id: editingServicio!.id, data });
    setEditingServicio(null);
    toast.success("Servicio actualizado");
  }

  return (
    <>
      <PageHeader
        title="Servicios de Internación"
        actionLabel={isAdmin ? "Nuevo" : undefined}
        onAction={isAdmin ? () => setShowForm(true) : undefined}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre..."
          />
        </div>
        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState label="servicios" />
        ) : (
          <>
            <div className="space-y-3">
              {list.data.map((s: ServicioInternacion) => (
                <Card key={s.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        {s.nombre_servicio}
                      </p>
                      {s.bloque_piso && (
                        <p className="text-sm text-muted">{s.bloque_piso}</p>
                      )}
                    </div>
                    {isAdmin && (
                      <EditButton onClick={() => setEditingServicio(s)} />
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
              label="servicios"
            />
          </>
        )}
      </div>
      {isAdmin && (
        <ServicioForm
          key={editingServicio?.id ?? "create"}
          isOpen={showForm || !!editingServicio}
          onClose={() => {
            setShowForm(false);
            setEditingServicio(null);
          }}
          onSubmit={editingServicio ? handleUpdate : handleCreate}
          initialData={editingServicio ?? undefined}
        />
      )}
    </>
  );
}
