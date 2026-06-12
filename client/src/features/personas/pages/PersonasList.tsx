import { useState } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";
import {
  usePersonas,
  useSearchPersonas,
  useCreatePersona,
  useUpdatePersona,
} from "../hooks/usePersonas";
import PersonaForm from "../components/PersonaForm";
import type {
  CreatePersonaPayload,
  Persona,
} from "../../../shared/types/persona";
import PageHeader from "../../../shared/components/PageHeader";
import SearchInput from "../../../shared/components/SearchInput";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";
import Card from "../../../shared/components/Card";
import EditButton from "../../../shared/components/EditButton";
import Pagination from "../../../shared/components/Pagination";

export default function PersonasList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const limit = 10;
  const { data, isLoading } = usePersonas(page * limit, limit);
  const { data: searchData, isLoading: searchLoading } = useSearchPersonas({
    query: search,
    offset: page * limit,
    limit,
  });
  const createMutation = useCreatePersona();
  const updateMutation = useUpdatePersona();
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  async function handleCreate(data: CreatePersonaPayload) {
    await createMutation.mutateAsync(data);
    setShowForm(false);
    toast.success("Persona creada");
  }

  async function handleUpdate(data: CreatePersonaPayload) {
    if (!editingPersona) return;
    await updateMutation.mutateAsync({ id: editingPersona.id, data });
    setEditingPersona(null);
    toast.success("Persona actualizada");
  }

  return (
    <>
      <PageHeader
        title="Personas"
        actionLabel="Nueva"
        onAction={() => setShowForm(true)}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por nombre, apellido o DNI..."
            />
        </div>
        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState
            label="personas"
            actionLabel="Crear primera persona"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <>
            <div className="space-y-3">
              {list.data.map((p: Persona) => (
                <Card key={p.id} className="border-l-4 border-l-teal-400">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                      <User size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-gray-900">
                        {p.nombre} {p.apellido}
                      </p>
                      <p className="text-sm font-medium text-teal-600">
                        DNI {p.dni}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        {p.fecha_nacimiento && (
                          <span>Nac: {p.fecha_nacimiento}</span>
                        )}
                        {p.telefono && <span>Tel: {p.telefono}</span>}
                      </div>
                    </div>
                    <EditButton onClick={() => setEditingPersona(p)} />
                  </div>
                </Card>
              ))}
            </div>
            <Pagination
              page={page}
              total={list?.total ?? 0}
              limit={limit}
              onPageChange={setPage}
              label="personas"
            />
          </>
        )}
      </div>
      <PersonaForm
        key="create"
        isOpen={showForm}
        title="Nueva Persona"
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
      <PersonaForm
        key={editingPersona?.id ?? "edit"}
        isOpen={!!editingPersona}
        title="Editar Persona"
        onClose={() => setEditingPersona(null)}
        onSubmit={handleUpdate}
        initialData={editingPersona ?? undefined}
      />
    </>
  );
}
