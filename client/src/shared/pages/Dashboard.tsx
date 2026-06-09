import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-8">
        <p className="text-sm text-gray-500">Bienvenido</p>
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.name} {user?.lastname}
        </h2>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <button
          disabled
          className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-400 transition"
        >
          🔜 Escanear DNI
        </button>
        <button
          disabled
          className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-400 transition"
        >
          🔜 Pacientes Internados
        </button>
        <button
          disabled
          className="w-full rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-400 transition"
        >
          🔜 Reportes
        </button>
        {user?.role == "ADMIN" && (
          <button
            className="w-full rounded-lg border border-blue-600 bg-blue-200 px-4 py-6 text-s hover:cursor-pointer transition"
            onClick={() => navigate("/admin/users")}
          >
            👥 Gestion de Usuarios
          </button>
        )}
      </div>
    </div>
  );
}
