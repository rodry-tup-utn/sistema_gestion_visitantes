import { User, MapPin, Calendar } from "lucide-react";
import type { OcupacionPaciente } from "../../shared/types/internacion";

interface Props {
  ocupacion: OcupacionPaciente;
  onAlta: (id: number) => void;
  onFallecido: (id: number) => void;
  isPending: boolean;
}

const estadoConfig: Record<string, { border: string; badge: string }> = {
  Internado: { border: "border-l-green-600", badge: "bg-green-600 text-white" },
  Alta: { border: "border-l-gray-500", badge: "bg-gray-600 text-white" },
  Fallecido: { border: "border-l-red-600", badge: "bg-red-600 text-white" },
};

export default function OcupacionCard({ ocupacion: o, onAlta, onFallecido, isPending }: Props) {
  const config = estadoConfig[o.estado] ?? estadoConfig.Alta;

  return (
    <div className={`rounded-xl border-l-4 bg-card p-5 shadow-sm tracking-tight ${config.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <User size={16} />
            </div>
            <p className="text-base font-bold text-gray-900 truncate">
              {o.paciente_nombre_cache}
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
            <MapPin size={14} className="shrink-0 text-muted" />
            {o.ubicacion_cache}
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-muted">
            <Calendar size={12} />
            Ingreso: {new Date(o.fecha_ingreso).toLocaleDateString()}
            {o.fecha_alta && <> | Alta: {new Date(o.fecha_alta).toLocaleDateString()}</>}
          </div>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-tight shrink-0 ${config.badge}`}>
          {o.estado.toUpperCase()}
        </span>
      </div>

      {o.estado === "Internado" && (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => onAlta(o.id)}
            disabled={isPending}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold tracking-tight text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Alta
          </button>
          <button
            onClick={() => onFallecido(o.id)}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold tracking-tight text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            Fallecido
          </button>
        </div>
      )}
    </div>
  );
}
