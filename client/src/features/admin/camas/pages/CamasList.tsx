import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCamas, useSearchCamas, useCreateCama, useUpdateCama } from "../hooks/useCamas";
import CamaForm from "../components/CamaForm";
import { useServicios } from "../../servicios-internacion/hooks/useServiciosInternacion";
import type { CreateCamaPayload, Cama } from "../../../../shared/types/internacion";
import PageHeader from "../../../../shared/components/PageHeader";
import Spinner from "../../../../shared/components/Spinner";
import Card from "../../../../shared/components/Card";
import Badge from "../../../../shared/components/Badge";
import EmptyState from "../../../../shared/components/EmptyState";
import Pagination from "../../../../shared/components/Pagination";
import SearchInput from "../../../../shared/components/SearchInput";
import EditButton from "../../../../shared/components/EditButton";

const estadoVariants: Record<
  string,
  "success" | "danger" | "warning" | "default"
> = {
  Disponible: "success",
  Ocupada: "danger",
  Mantenimiento: "warning",
  "No Disponible": "default",
};

export default function CamasList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [servicioId, setServicioId] = useState<number | undefined>(undefined);
  const [estadoDisponibilidad, setEstadoDisponibilidad] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingCama, setEditingCama] = useState<Cama | null>(null);
  const limit = 20;
  const { data: serviciosData } = useServicios();
  const { data, isLoading } = useCamas(page * limit, limit, servicioId, estadoDisponibilidad);
  const { data: searchData, isLoading: searchLoading } = useSearchCamas(
    search,
    page * limit,
    limit,
    servicioId,
    estadoDisponibilidad,
  );
  const createMutation = useCreateCama();
  const updateMutation = useUpdateCama();
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  useEffect(() => {
    setPage(0);
  }, [search, servicioId, estadoDisponibilidad]);

  async function handleCreate(data: CreateCamaPayload) {
    await createMutation.mutateAsync(data);
    setShowForm(false);
    toast.success("Cama creada");
  }

  async function handleUpdate(data: CreateCamaPayload) {
    await updateMutation.mutateAsync({ id: editingCama!.id, data });
    setEditingCama(null);
    toast.success("Cama actualizada");
  }

  return (
    <>
      <PageHeader
        title="Camas de Internación"
        actionLabel="Nueva"
        onAction={() => setShowForm(true)}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por sala, cama o servicio..."
            />
          </div>
          <select
            value={servicioId ?? ""}
            onChange={(e) =>
              setServicioId(e.target.value ? Number(e.target.value) : undefined)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los servicios</option>
            {(serviciosData?.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre_servicio}
              </option>
            ))}
          </select>
          <select
            value={estadoDisponibilidad ?? ""}
            onChange={(e) =>
              setEstadoDisponibilidad(e.target.value || undefined)
            }
            className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="No Disponible">No Disponible</option>
          </select>
        </div>
        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState label="camas" />
        ) : (
          <>
            <div className="space-y-3">
              {list.data.map((c) => (
                <Card key={c.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">
                        Sala {c.sala} - Cama {c.cama}
                      </p>
                      <p className="text-sm text-muted">
                        {c.servicio_nombre_cache}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          estadoVariants[c.estado_disponibilidad] ?? "default"
                        }
                      >
                        {c.estado_disponibilidad}
                      </Badge>
                      <EditButton onClick={() => setEditingCama(c)} />
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
              label="camas"
            />
          </>
        )}
      </div>
      <CamaForm
        key={editingCama?.id ?? 'create'}
        isOpen={showForm || !!editingCama}
        onClose={() => { setShowForm(false); setEditingCama(null); }}
        onSubmit={editingCama ? handleUpdate : handleCreate}
        initialData={editingCama ?? undefined}
      />
    </>
  );
}
