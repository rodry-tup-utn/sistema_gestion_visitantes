import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export default function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Inicio
        </button>
        <span className="text-sm font-bold text-gray-900">
          Sistema de Gestion de Visitates
        </span>
        <button
          onClick={logout}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Salir
        </button>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-white px-4 py-3 text-center text-xs text-gray-400">
        SGV — Sistema de Gestión de Visitantes
      </footer>
    </div>
  );
}
