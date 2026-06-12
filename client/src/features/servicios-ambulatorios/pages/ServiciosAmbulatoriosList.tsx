import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../auth/context/useAuth";
import {
  useServicios,
  useSearchServicios,
  useCreateServicio,
  useUpdateServicio,
} from "../hooks/useServiciosAmbulatorios";
import ServicioAmbulatorioForm from "../components/ServicioAmbulatorioForm";
import type {
  CreateServicioAmbulatorioPayload,
  ServicioAmbulatorio,
} from "../../../shared/types/internacion";
import PageHeader from "../../../shared/components/PageHeader";
import SearchInput from "../../../shared/components/SearchInput";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";
import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import EditButton from "../../../shared/components/EditButton";
import Pagination from "../../../shared/components/Pagination";

const estadoVariants: Record<string, "success" | "danger"> = {
  Activo: "success",
  Inactivo: "danger",
};

export default function ServiciosAmbulatoriosList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] =
    useState<ServicioAmbulatorio | null>(null);
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

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  async function handleCreate(data: CreateServicioAmbulatorioPayload) {
    await createMutation.mutateAsync(data);
    setShowForm(false);
    toast.success("Servicio ambulatorio creado");
  }

  async function handleUpdate(data: CreateServicioAmbulatorioPayload) {
    await updateMutation.mutateAsync({ id: editingServicio!.id, data });
    setEditingServicio(null);
    toast.success("Servicio ambulatorio actualizado");
  }

  return (
    <>
      <PageHeader
        title="Servicios Ambulatorios"
        actionLabel={isAdmin ? "Nuevo" : undefined}
        onAction={isAdmin ? () => setShowForm(true) : undefined}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre o ubicación..."
            />
        </div>
        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState label="servicios ambulatorios" />
        ) : (
          <>
            <div className="space-y-3">
              {list.data.map((s: ServicioAmbulatorio) => (
                <Card key={s.id} className="border-l-4 border-l-purple-400">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <Stethoscope size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-gray-900">
                        {s.nombre_servicio}
                      </p>
                      {s.ubicacion_interna && (
                        <p className="text-sm text-gray-500">
                          {s.ubicacion_interna}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={estadoVariants[s.estado] ?? "default"}>
                        {s.estado}
                      </Badge>
                      {isAdmin && (
                        <EditButton onClick={() => setEditingServicio(s)} />
                      )}
                    </div>
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
        <ServicioAmbulatorioForm
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
