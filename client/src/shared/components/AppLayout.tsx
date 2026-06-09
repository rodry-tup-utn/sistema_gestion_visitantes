import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Home, ArrowLeft, Menu } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import Badge from "./Badge";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-10 border-b bg-card/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted transition hover:text-gray-700"
              title="Menú"
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-md p-1.5 text-muted transition hover:text-gray-700"
              title="Volver"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-gray-700"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Inicio</span>
            </button>
          </div>
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

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

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
