import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Home } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import Badge from "./Badge";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-10 border-b bg-card/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-gray-700"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Inicio</span>
          </button>
          <span className="text-sm font-bold text-gray-900">SGV</span>
          <div className="flex items-center gap-3">
            {user?.role === "ADMIN" && <Badge variant="purple">Admin</Badge>}
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-gray-700"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card px-4 py-3 text-center text-xs text-muted">
        <div className="mx-auto max-w-5xl">
          SGV — Sistema de Gestión de Visitantes
        </div>
      </footer>
    </div>
  );
}
