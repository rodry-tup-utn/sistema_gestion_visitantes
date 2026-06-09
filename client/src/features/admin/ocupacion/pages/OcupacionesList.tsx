import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useOcupaciones, useSearchOcupaciones, useAdmitir, useDarAlta, useRegistrarFallecimiento } from "../hooks/useOcupaciones";
import AdmitirForm from "../components/AdmitirForm";
import type { AdmitirPayload } from "../../../../shared/types/internacion";
import PageHeader from "../../../../shared/components/PageHeader";
import Spinner from "../../../../shared/components/Spinner";
import Card from "../../../../shared/components/Card";
import Badge from "../../../../shared/components/Badge";
import EmptyState from "../../../../shared/components/EmptyState";
import Pagination from "../../../../shared/components/Pagination";
import SearchInput from "../../../../shared/components/SearchInput";

const estadoVariants: Record<string, "success" | "danger" | "warning" | "default"> = {
  Internado: "success",
  Alta: "default",
  Fallecido: "danger",
};

export default function OcupacionesList() {
  const [page, setPage] = useState(0);
  const [soloActivos, setSoloActivos] = useState(true);
  const [search, setSearch] = useState("");
  const limit = 20;
  const { data, isLoading } = useOcupaciones(page * limit, limit, soloActivos);
  const { data: searchData, isLoading: searchLoading } = useSearchOcupaciones(search, page * limit, limit);
  const admitir = useAdmitir();
  const darAlta = useDarAlta();
  const registrarFallecimiento = useRegistrarFallecimiento();
  const [showAdmitir, setShowAdmitir] = useState(false);
  const isSearching = search.length >= 2;
  const list = isSearching ? searchData : data;

  useEffect(() => { setPage(0); }, [search, soloActivos]);

  async function handleAdmitir(data: AdmitirPayload) {
    await admitir.mutateAsync(data);
    toast.success("Paciente admitido");
  }

  async function handleAlta(id: number) {
    await darAlta.mutateAsync(id);
    toast.success("Alta registrada");
  }

  async function handleFallecimiento(id: number) {
    await registrarFallecimiento.mutateAsync(id);
    toast.success("Fallecimiento registrado");
  }

  return (
    <>
      <PageHeader title="Ocupación de Pacientes" actionLabel="Admitir" onAction={() => setShowAdmitir(true)} />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar paciente o ubicación..." />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setPage(0); setSoloActivos(true); }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${soloActivos ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Activos
            </button>
            <button
              onClick={() => { setPage(0); setSoloActivos(false); }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${!soloActivos ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Todos
            </button>
          </div>
        </div>

        {isLoading || searchLoading ? (
          <Spinner />
        ) : !list?.data.length ? (
          <EmptyState label="pacientes internados" />
        ) : (
          <>
            <div className="space-y-3">
              {list.data.map((o) => (
                <Card key={o.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{o.paciente_nombre_cache}</p>
                      <p className="text-sm text-muted">{o.ubicacion_cache}</p>
                      <p className="text-xs text-muted mt-1">
                        Ingreso: {new Date(o.fecha_ingreso).toLocaleDateString()}
                        {o.fecha_alta && ` | Alta: ${new Date(o.fecha_alta).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={estadoVariants[o.estado] ?? "default"}>{o.estado}</Badge>
                      {o.estado === "Internado" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAlta(o.id)}
                            className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 transition hover:bg-green-200"
                          >
                            Alta
                          </button>
                          <button
                            onClick={() => handleFallecimiento(o.id)}
                            className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 transition hover:bg-red-200"
                          >
                            Fallecido
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Pagination page={page} total={list?.total ?? 0} limit={limit} onPageChange={setPage} label="pacientes" />
          </>
        )}
      </div>
      <AdmitirForm isOpen={showAdmitir} onClose={() => setShowAdmitir(false)} onSubmit={handleAdmitir} />
    </>
  );
}
