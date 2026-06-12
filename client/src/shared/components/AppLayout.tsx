import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Home, ArrowLeft, Menu, User } from "lucide-react";
import { useAuth } from "../../features/auth/context/useAuth";
import Badge from "./Badge";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-10 border-b bg-card/80 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-1 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-muted transition hover:bg-gray-100 hover:text-gray-700 sm:p-2"
              title="Menú"
            >
              <Menu size={20} className="sm:size-[22]" />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg bg-gray-100 p-1.5 text-muted transition hover:bg-gray-200 hover:text-gray-700 sm:p-2"
              title="Volver"
            >
              <ArrowLeft size={20} className="sm:size-[22]" />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition hover:bg-gray-100 hover:text-gray-700 sm:gap-2 sm:px-3 sm:py-2"
            >
              <Home size={20} className="sm:size-[22]" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
          </div>

          <span className="text-base font-extrabold tracking-tight text-gray-900 sm:text-lg">
            SGV
          </span>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition hover:bg-gray-100 hover:text-gray-700 sm:gap-2 sm:px-3 sm:py-2"
              title="Mi Perfil"
            >
              <User size={20} className="sm:size-[22]" />
              <span className="hidden sm:inline">Perfil</span>
            </button>
            <p className="hidden truncate text-sm font-medium text-muted sm:block sm:max-w-30">
              {user?.email}
            </p>
            {user?.role === "ADMIN" && (
              <span className="hidden sm:inline">
                <Badge variant="purple">Admin</Badge>
              </span>
            )}
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition hover:bg-gray-100 hover:text-gray-700 sm:gap-2 sm:px-3 sm:py-2"
            >
              <LogOut size={20} className="sm:size-[22]" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

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
