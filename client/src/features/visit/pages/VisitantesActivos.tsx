import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RefreshCw, Clock } from "lucide-react";
import { useActivos, useFinalizarAccesoInternacion, useFinalizarAccesoAmbulatorio, useRenovarAccesoInternacion, useRenovarAccesoAmbulatorio } from "../hooks/useAccesos";
import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";
import SearchInput from "../../../shared/components/SearchInput";
import Pagination from "../../../shared/components/Pagination";

export default function VisitantesActivos() {
  const [query, setQuery] = useState("");
  const [dni, setDni] = useState("");
  const [tipoAcceso, setTipoAcceso] = useState("");
  const [page, setPage] = useState(0);
  const limit = 30;

  const { data, isLoading } = useActivos(
    query.length >= 2 ? query : undefined,
    dni || undefined,
    tipoAcceso || undefined,
    page * limit,
    limit,
  );

  const finInt = useFinalizarAccesoInternacion();
  const finAml = useFinalizarAccesoAmbulatorio();
  const renInt = useRenovarAccesoInternacion();
  const renAml = useRenovarAccesoAmbulatorio();

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  useEffect(() => { setPage(0); }, [query, dni, tipoAcceso]);

  async function handleFinalizar(item: { id: number; tipo: string }) {
    if (item.tipo === "internacion") {
      await finInt.mutateAsync(item.id);
    } else {
      await finAml.mutateAsync(item.id);
    }
    toast.success("Egreso registrado");
  }

  async function handleRenovar(item: { id: number; tipo: string }) {
    if (item.tipo === "internacion") {
      await renInt.mutateAsync(item.id);
    } else {
      await renAml.mutateAsync(item.id);
    }
    toast.success("Acceso renovado");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-lg font-bold text-gray-900">
        Visitantes Activos
        {total > 0 && <span className="ml-2 text-sm font-normal text-muted">({total})</span>}
      </h1>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre o destino..." />
        </div>
        <input
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Filtrar por DNI..."
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
        />
        <select
          value={tipoAcceso}
          onChange={(e) => setTipoAcceso(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-44"
        >
          <option value="">Todos los tipos</option>
          <option value="Visita Estandar">Visita Estandar</option>
          <option value="Cuidador">Cuidador</option>
          <option value="Urgencia">Urgencia</option>
          <option value="Consulta">Consulta</option>
          <option value="Estudio">Estudio</option>
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState label="visitantes activos" />
      ) : (
        <>
          <div className="space-y-3">
            {items.map((v) => (
              <Card key={`${v.tipo}-${v.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{v.persona_nombre_cache}</p>
                    <p className="text-xs text-muted">DNI: {v.persona_dni}</p>
                    <p className="text-sm text-muted">
                      {v.tipo === "internacion" ? "Internación" : "Ambulatorio"} — {v.destino_cache}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <Clock size={12} />
                      {v.tipo_acceso} — {Math.floor(v.minutos_transcurridos / 60)}h {v.minutos_transcurridos % 60}m
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {v.vencido ? (
                      <Badge variant="danger">Vencida</Badge>
                    ) : (
                      <Badge variant="success">Activo</Badge>
                    )}
                    <div className="flex gap-1">
                      {v.vencido && (
                        <button
                          onClick={() => handleRenovar(v)}
                          disabled={renInt.isPending || renAml.isPending}
                          className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                        >
                          <RefreshCw size={12} />
                          Renovar
                        </button>
                      )}
                      <button
                        onClick={() => handleFinalizar(v)}
                        disabled={finInt.isPending || finAml.isPending}
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                      >
                        Finalizar
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} total={total} limit={limit} onPageChange={setPage} label="visitantes" />
        </>
      )}
    </div>
  );
}
