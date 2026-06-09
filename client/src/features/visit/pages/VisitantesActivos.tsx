import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  useActivos,
  useFinalizarAccesoInternacion,
  useFinalizarAccesoAmbulatorio,
  useRenovarAccesoInternacion,
  useRenovarAccesoAmbulatorio,
} from "../hooks/useAccesos";
import AccessCard from "../components/AccessCard";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";
import SearchInput from "../../../shared/components/SearchInput";
import Pagination from "../../../shared/components/Pagination";

const tipoAccesoOptions = [
  { value: "", label: "Todos los tipos" },
  { value: "Visita Estandar", label: "Visita Estandar" },
  { value: "Cuidador", label: "Cuidador" },
  { value: "Urgencia", label: "Urgencia" },
  { value: "Consulta", label: "Consulta" },
  { value: "Estudio", label: "Estudio" },
];

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
  const hasFilters =
    query.length > 0 || dni.length > 0 || tipoAcceso.length > 0;

  const countInt = items.filter((v) => v.tipo === "internacion").length;
  const countAmb = items.filter((v) => v.tipo === "ambulatorio").length;

  useEffect(() => {
    setPage(0);
  }, [query, dni, tipoAcceso]);

  function handleLimpiar() {
    setQuery("");
    setDni("");
    setTipoAcceso("");
    setPage(0);
  }

  async function handleFinalizar(id: number, tipo: string) {
    if (tipo === "internacion") {
      await finInt.mutateAsync(id);
    } else {
      await finAml.mutateAsync(id);
    }
    toast.success("Egreso registrado");
  }

  async function handleRenovar(id: number, tipo: string) {
    if (tipo === "internacion") {
      await renInt.mutateAsync(id);
    } else {
      await renAml.mutateAsync(id);
    }
    toast.success("Acceso renovado");
  }

  const isPending =
    finInt.isPending ||
    finAml.isPending ||
    renInt.isPending ||
    renAml.isPending;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-2 text-lg font-bold text-gray-900">
        Visitantes Activos
        {total > 0 && (
          <span className="ml-2 text-sm font-normal text-muted">({total})</span>
        )}
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          Internación: {countInt}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          Ambulatorio: {countAmb}
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Buscar por nombre o destino..."
          />
        </div>
        <input
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          placeholder="Filtrar por DNI..."
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-40"
        />
        <select
          value={tipoAcceso}
          onChange={(e) => setTipoAcceso(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-40"
        >
          {tipoAccesoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={handleLimpiar}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          >
            <RotateCcw size={15} />
            Limpiar
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState label="visitantes activos" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((v) => (
              <AccessCard
                key={`${v.tipo}-${v.id}`}
                item={v}
                onFinalizar={handleFinalizar}
                onRenovar={handleRenovar}
                isPending={isPending}
              />
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
              label="visitantes"
            />
          </div>
        </>
      )}
    </div>
  );
}
