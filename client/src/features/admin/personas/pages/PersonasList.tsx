import { useState, useEffect } from "react";
import { toast } from "sonner";
import { usePersonas, useSearchPersonas, useCreatePersona, useUpdatePersona } from "../hooks/usePersonas";
import PersonaForm from "../components/PersonaForm";
import type { CreatePersonaPayload, Persona } from "../../../../shared/types/persona";
import PageHeader from "../../../../shared/components/PageHeader";
import Spinner from "../../../../shared/components/Spinner";
import Card from "../../../../shared/components/Card";
import EmptyState from "../../../../shared/components/EmptyState";
import Pagination from "../../../../shared/components/Pagination";
import SearchInput from "../../../../shared/components/SearchInput";
import EditButton from "../../../../shared/components/EditButton";

export default function PersonasList() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const limit = 20;
  const { data, isLoading } = usePersonas(page * limit, limit);
  const { data: searchData, isLoading: searchLoading } = useSearchPersonas(search, page * limit, limit);
  const createMutation = useCreatePersona();
  const updateMutation = useUpdatePersona();
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  useEffect(() => { setPage(0); }, [search]);

  async function handleCreate(data: CreatePersonaPayload) {
    await createMutation.mutateAsync(data);
    setShowForm(false);
    toast.success("Persona creada");
  }

  async function handleUpdate(data: CreatePersonaPayload) {
    await updateMutation.mutateAsync({ id: editingPersona!.id, data });
    setEditingPersona(null);
    toast.success("Persona actualizada");
  }

  return (
    <>
      <PageHeader title="Personas" actionLabel="Nueva" onAction={() => setShowForm(true)} />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por DNI, nombre o apellido..." />
        </div>
        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState label="personas" actionLabel="Crear primera persona" onAction={() => setShowForm(true)} />
        ) : (
          <>
            <div className="space-y-3">
              {list.data.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{p.nombre} {p.apellido}</p>
                      <p className="text-sm text-gray-500">DNI: {p.dni}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right text-xs text-muted">
                        {p.fecha_nacimiento && <p>Nac: {p.fecha_nacimiento}</p>}
                        {p.telefono && <p>Tel: {p.telefono}</p>}
                      </div>
                      <EditButton onClick={() => setEditingPersona(p)} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={page} total={list?.total ?? 0} limit={limit} onPageChange={setPage} label="personas" />
          </>
        )}
      </div>
      <PersonaForm
        key={editingPersona?.id ?? 'create'}
        isOpen={showForm || !!editingPersona}
        onClose={() => { setShowForm(false); setEditingPersona(null); }}
        onSubmit={editingPersona ? handleUpdate : handleCreate}
        initialData={editingPersona ?? undefined}
      />
    </>
  );
}
