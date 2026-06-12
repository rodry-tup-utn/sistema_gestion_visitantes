import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  DoorOpen,
  Bed,
  ClipboardList,
  Users,
  Building,
  Hospital,
  Stethoscope,
  AlertTriangle,
  UserPlus,
  UserCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import type { User } from "../types/user";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

interface NavLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navLinks: NavLink[] = [
  { label: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
  { label: "Mi Perfil", path: "/profile", icon: <UserIcon size={18} /> },
  {
    label: "Ingreso Internación",
    path: "/porteria/ingreso-internacion",
    icon: <Bed size={18} />,
  },
  {
    label: "Ingreso Ambulatorio",
    path: "/porteria/ingreso-ambulatorio",
    icon: <UserPlus size={18} />,
  },
  {
    label: "Visitantes",
    path: "/porteria/visitantes",
    icon: <UserCheck size={18} />,
  },
  {
    label: "Alertas",
    path: "/porteria/alertas",
    icon: <AlertTriangle size={18} />,
  },
  {
    label: "Personas",
    path: "/admin/personas",
    icon: <ClipboardList size={18} />,
  },
  {
    label: "Ocupación",
    path: "/admin/ocupacion",
    icon: <Stethoscope size={18} />,
  },
  {
    label: "Usuarios",
    path: "/admin/users",
    icon: <Users size={18} />,
    adminOnly: true,
  },
  {
    label: "Serv. Internación",
    path: "/admin/servicios-internacion",
    icon: <Building size={18} />,
    adminOnly: true,
  },
  {
    label: "Camas",
    path: "/admin/internacion",
    icon: <Hospital size={18} />,
    adminOnly: true,
  },
  {
    label: "Serv. Ambulatorios",
    path: "/admin/servicios-ambulatorios",
    icon: <DoorOpen size={18} />,
    adminOnly: true,
  },
];

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleNav(path: string) {
    navigate(path);
    onClose();
  }

  function isActive(path: string) {
    return location.pathname === path;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-card shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-bold text-gray-900">SGV</span>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted transition hover:text-gray-700"
            title="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navLinks
              .filter((link) => !link.adminOnly || user?.role === "ADMIN")
              .map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive(link.path)
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              ))}
          </div>
        </nav>
      </div>
    </>
  );
}
