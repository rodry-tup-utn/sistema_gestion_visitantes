import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, Building, Bed, Hospital, Stethoscope, QrCode, BarChart3 } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";

interface NavCardProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function NavCard({ icon, label, onClick }: NavCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl bg-card p-5 shadow-sm transition hover:shadow-md active:scale-[0.97] cursor-pointer"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 text-center">
        <p className="text-sm text-muted">Bienvenido</p>
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.name} {user?.lastname}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {user?.role === "ADMIN" && (
          <>
            <NavCard icon={<Users size={22} />} label="Usuarios" onClick={() => navigate("/admin/users")} />
            <NavCard icon={<ClipboardList size={22} />} label="Personas" onClick={() => navigate("/admin/personas")} />
            <NavCard icon={<Building size={22} />} label="Serv. Internación" onClick={() => navigate("/admin/servicios-internacion")} />
            <NavCard icon={<Bed size={22} />} label="Camas" onClick={() => navigate("/admin/internacion")} />
            <NavCard icon={<Hospital size={22} />} label="Serv. Ambulatorios" onClick={() => navigate("/admin/servicios-ambulatorios")} />
            <NavCard icon={<Stethoscope size={22} />} label="Ocupación" onClick={() => navigate("/admin/ocupacion")} />
          </>
        )}

        <button
          disabled
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-card p-5 text-muted"
        >
          <QrCode size={22} />
          <span className="text-sm">Escanear DNI</span>
        </button>
        <button
          disabled
          className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-card p-5 text-muted"
        >
          <BarChart3 size={22} />
          <span className="text-sm">Reportes</span>
        </button>
      </div>
    </div>
  );
}
