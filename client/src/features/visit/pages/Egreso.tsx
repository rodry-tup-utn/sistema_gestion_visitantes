import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useAccesosInternacion, useFinalizarAccesoInternacion, useAccesosAmbulatorio, useFinalizarAccesoAmbulatorio, useRenovarAccesoInternacion, useRenovarAccesoAmbulatorio } from "../hooks/useAccesos";
import { useSearchPersonas } from "../../admin/personas/hooks/usePersonas";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import Spinner from "../../../shared/components/Spinner";
import Badge from "../../../shared/components/Badge";

export default function Egreso() {
  const [searchDni, setSearchDni] = useState("");
  const [personaId, setPersonaId] = useState<number | null>(null);
  const [personaNombre, setPersonaNombre] = useState("");

  const { data: searchData } = useSearchPersonas({ dni: searchDni });
  const { data: accIntData, isLoading: loadingInt } = useAccesosInternacion(0, 50, true, personaId ?? undefined);
  const { data: accAmlData, isLoading: loadingAml } = useAccesosAmbulatorio(0, 50, true, personaId ?? undefined);
  const finInt = useFinalizarAccesoInternacion();
  const finAml = useFinalizarAccesoAmbulatorio();
  const renInt = useRenovarAccesoInternacion();
  const renAml = useRenovarAccesoAmbulatorio();

  function handleSearchPersona() {
    if (!searchDni) return;
    const found = searchData?.data.find((p) => p.dni === searchDni);
    if (found) {
      setPersonaId(found.id);
      setPersonaNombre(`${found.nombre} ${found.apellido}`);
    } else {
      toast.error("Persona no encontrada");
    }
  }

  async function handleFinalizarInt(id: number) {
    await finInt.mutateAsync(id);
    toast.success("Egreso de internación registrado");
  }

  async function handleFinalizarAml(id: number) {
    await finAml.mutateAsync(id);
    toast.success("Egreso ambulatorio registrado");
  }

  async function handleRenovarInt(id: number) {
    await renInt.mutateAsync(id);
    toast.success("Acceso renovado");
  }

  async function handleRenovarAml(id: number) {
    await renAml.mutateAsync(id);
    toast.success("Acceso renovado");
  }

  const accesosInt = accIntData?.data ?? [];
  const accesosAml = accAmlData?.data ?? [];
  const hasAccesos = accesosInt.length > 0 || accesosAml.length > 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-lg font-bold text-gray-900">Registrar Egreso</h1>

      <div className="mb-4 flex items-end gap-2">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Buscar por DNI</label>
          <input
            value={searchDni}
            onChange={(e) => setSearchDni(e.target.value)}
            placeholder="Ingresar DNI..."
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleSearchPersona}>Buscar</Button>
      </div>

      {personaId && (
        <p className="mb-4 text-sm font-medium text-gray-700">Persona: {personaNombre}</p>
      )}

      {personaId && (loadingInt || loadingAml) ? (
        <Spinner />
      ) : personaId && !hasAccesos ? (
        <p className="text-sm text-muted">No tiene accesos activos</p>
      ) : personaId ? (
        <div className="space-y-4">
          {accesosInt.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">Internación</p>
                  <p className="text-sm text-muted">Paciente: {a.paciente_nombre_cache}</p>
                  <p className="text-sm text-muted">{a.ubicacion_cache}</p>
                  <p className="text-xs text-muted mt-1">
                    {a.tipo_acceso} — Ingreso: {new Date(a.fecha_ingreso).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {a.vencido ? (
                    <Badge variant="danger">Vencida</Badge>
                  ) : (
                    <Badge variant="success">Activo</Badge>
                  )}
                  <div className="flex gap-1">
                    {a.vencido && (
                      <button
                        onClick={() => handleRenovarInt(a.id)}
                        disabled={renInt.isPending}
                        className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                      >
                        <RefreshCw size={12} />
                        Renovar
                      </button>
                    )}
                    <Button variant="danger" onClick={() => handleFinalizarInt(a.id)} loading={finInt.isPending}>
                      Finalizar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {accesosAml.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">Ambulatorio</p>
                  <p className="text-sm text-muted">Servicio: {a.servicio_nombre_cache}</p>
                  <p className="text-xs text-muted mt-1">
                    {a.tipo_acceso} — Ingreso: {new Date(a.fecha_ingreso).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {a.vencido ? (
                    <Badge variant="danger">Vencida</Badge>
                  ) : (
                    <Badge variant="success">Activo</Badge>
                  )}
                  <div className="flex gap-1">
                    {a.vencido && (
                      <button
                        onClick={() => handleRenovarAml(a.id)}
                        disabled={renAml.isPending}
                        className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                      >
                        <RefreshCw size={12} />
                        Renovar
                      </button>
                    )}
                    <Button variant="danger" onClick={() => handleFinalizarAml(a.id)} loading={finAml.isPending}>
                      Finalizar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
