import { useNavigate } from "react-router-dom";
import { DoorOpen, DoorClosed, LogOut, AlertTriangle, UserPlus } from "lucide-react";

export default function VisitDashboard() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Portería</h2>
        <p className="text-sm text-muted">Gestión de ingresos y egresos</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/porteria/ingreso-internacion")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm transition hover:shadow-md active:scale-[0.97] cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <DoorOpen size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Ingreso Internación</span>
        </button>

        <button
          onClick={() => navigate("/porteria/ingreso-ambulatorio")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm transition hover:shadow-md active:scale-[0.97] cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <UserPlus size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Ingreso Ambulatorio</span>
        </button>

        <button
          onClick={() => navigate("/porteria/visitantes")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm transition hover:shadow-md active:scale-[0.97] cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <LogOut size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Visitantes</span>
        </button>

        <button
          onClick={() => navigate("/porteria/alertas")}
          className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm transition hover:shadow-md active:scale-[0.97] cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <AlertTriangle size={22} />
          </div>
          <span className="text-sm font-medium text-gray-700">Alertas</span>
        </button>
      </div>
    </div>
  );
}
