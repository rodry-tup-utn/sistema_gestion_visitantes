import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, Clock } from "lucide-react";
import { useAccesosVencidos, useRenovarAccesoInternacion, useRenovarAccesoAmbulatorio, useFinalizarAccesoInternacion, useFinalizarAccesoAmbulatorio } from "../hooks/useAccesos";
import Card from "../../../shared/components/Card";
import Badge from "../../../shared/components/Badge";
import Spinner from "../../../shared/components/Spinner";
import EmptyState from "../../../shared/components/EmptyState";

export default function Alertas() {
  const [page, setPage] = useState(0);
  const limit = 50;
  const { data, isLoading } = useAccesosVencidos(page * limit, limit);
  const renInt = useRenovarAccesoInternacion();
  const renAml = useRenovarAccesoAmbulatorio();
  const finInt = useFinalizarAccesoInternacion();
  const finAml = useFinalizarAccesoAmbulatorio();

  const vencidos = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / limit);

  async function handleRenovar(item: { id: number; tipo: string }) {
    if (item.tipo === "internacion") {
      await renInt.mutateAsync(item.id);
    } else {
      await renAml.mutateAsync(item.id);
    }
    toast.success("Acceso renovado");
  }

  async function handleFinalizar(item: { id: number; tipo: string }) {
    if (item.tipo === "internacion") {
      await finInt.mutateAsync(item.id);
    } else {
      await finAml.mutateAsync(item.id);
    }
    toast.success("Egreso registrado");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Alertas</h1>
          <p className="text-sm text-muted">{total} acceso{total !== 1 ? "s" : ""} vencido{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : vencidos.length === 0 ? (
        <EmptyState label="alertas de vencimiento" />
      ) : (
        <>
          <div className="space-y-3">
            {vencidos.map((v) => (
              <Card key={`${v.tipo}-${v.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{v.persona_nombre_cache}</p>
                    <p className="text-sm text-muted">
                      {v.tipo === "internacion" ? "Internación" : "Ambulatorio"} — {v.destino_cache}
                    </p>
                    <p className="text-xs text-muted mt-1">{v.tipo_acceso}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <Clock size={12} />
                      Vencido hace {Math.floor(v.minutos_transcurridos / 60)}h {v.minutos_transcurridos % 60}m
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="danger">Vencida</Badge>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleRenovar(v)}
                        disabled={renInt.isPending || renAml.isPending}
                        className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                      >
                        <RefreshCw size={12} />
                        Renovar
                      </button>
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

          {pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`rounded-lg px-3 py-1 text-sm ${
                    page === i ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
