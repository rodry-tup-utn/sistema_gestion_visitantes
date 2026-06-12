import {
  Clock,
  RefreshCw,
  User,
  MapPin,
  Tag,
  DoorOpen,
  Calendar,
} from "lucide-react";
import { TIEMPOS_ACCESO } from "../../../shared/types/visita";
import type { AccesoActivoItem } from "../../../shared/types/visita";

export default function AccessCard({
  item,
  onFinalizar,
  onRenovar,
  isPending,
}: {
  item: AccesoActivoItem;
  onFinalizar: (id: number, tipo: string) => void;
  onRenovar: (id: number, tipo: string) => void;
  isPending: boolean;
}) {
  const isInt = item.tipo === "internacion";

  const maxMin = TIEMPOS_ACCESO[item.tipo_acceso];

  const vencidoPct =
    item.tipo_acceso === "Urgencia"
      ? 0
      : Math.min(
          100,
          Math.round((item.minutos_transcurridos / maxMin) * 100),
        );

  const timerBg = item.vencido
    ? "bg-red-600 text-white"
    : vencidoPct >= 80
      ? "bg-red-100 text-red-700"
      : vencidoPct >= 50
        ? "bg-amber-100 text-amber-700"
        : "bg-green-100 text-green-700";

  const borderColor = item.vencido
    ? "border-l-red-500"
    : isInt
      ? "border-l-blue-500"
      : "border-l-emerald-500";

  const typeBadgeColor = isInt
    ? "bg-blue-100 text-blue-700"
    : "bg-emerald-100 text-emerald-700";

  const hours = Math.floor(item.minutos_transcurridos / 60);
  const mins = item.minutos_transcurridos % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const fechaIngreso = new Date(item.fecha_ingreso);
  const fechaExpiracion = new Date(fechaIngreso.getTime() + maxMin * 60 * 1000);

  const dtOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const ingresoStr = fechaIngreso.toLocaleDateString("es-AR", dtOptions);
  const expDateStr = fechaExpiracion.toLocaleDateString("es-AR", dtOptions);

  return (
    <div
      className={`rounded-xl border-l-4 bg-card p-5 shadow-sm ${borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <User size={16} />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900 truncate">
                {item.persona_nombre_cache}
              </p>
              <p className="text-xs text-muted">
                DNI {Number(item.persona_dni).toLocaleString("ES-Ar")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColor}`}
            >
              {isInt ? "Internación" : "Ambulatorio"}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={13} className="shrink-0 text-muted" />
              {item.destino_cache}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted">
            <Tag size={12} />
            {item.tipo_acceso}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${timerBg}`}
          >
            <Clock size={14} />
            <span>{timeStr}</span>
            {item.vencido && <span className="ml-0.5">· VENCIDA</span>}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted whitespace-nowrap">
            <Calendar size={11} />
            {ingresoStr}
          </span>
          <span className="text-[11px] text-muted whitespace-nowrap">
            Expira {expDateStr}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
        {item.vencido && (
          <button
            onClick={() => onRenovar(item.id, item.tipo)}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
          >
            <RefreshCw size={13} />
            Renovar
          </button>
        )}
        <button
          onClick={() => onFinalizar(item.id, item.tipo)}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-white text-sm font-bold tracking-tight hover:cursor-pointer transition hover:bg-red-800 disabled:opacity-50"
        >
          <DoorOpen size={13} />
          Finalizar
        </button>
      </div>
    </div>
  );
}
