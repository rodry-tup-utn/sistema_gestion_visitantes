import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Dashboard from "./shared/pages/Dashboard";
import UsersList from "./features/admin/users/pages/UsersList";
import PersonasList from "./features/admin/personas/pages/PersonasList";
import ServiciosList from "./features/admin/servicios-internacion/pages/ServiciosList";
import CamasList from "./features/admin/camas/pages/CamasList";
import ServiciosAmbulatoriosList from "./features/admin/servicios-ambulatorios/pages/ServiciosAmbulatoriosList";
import OcupacionesList from "./features/admin/ocupacion/pages/OcupacionesList";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AdminRoute from "./features/auth/components/AdminRoute";
import AppLayout from "./shared/components/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<UsersList />} />
            <Route path="/admin/personas" element={<PersonasList />} />
            <Route path="/admin/servicios-internacion" element={<ServiciosList />} />
            <Route path="/admin/internacion" element={<CamasList />} />
            <Route path="/admin/servicios-ambulatorios" element={<ServiciosAmbulatoriosList />} />
            <Route path="/admin/ocupacion" element={<OcupacionesList />} />
          </Route>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
