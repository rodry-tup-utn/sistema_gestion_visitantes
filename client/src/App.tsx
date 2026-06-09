import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Dashboard from "./shared/pages/Dashboard";
import UsersList from "./features/admin/users/pages/UsersList";
import PersonasList from "./features/personas/pages/PersonasList";
import ServiciosList from "./features/servicios-internacion/pages/ServiciosList";
import CamasList from "./features/camas/pages/CamasList";
import ServiciosAmbulatoriosList from "./features/servicios-ambulatorios/pages/ServiciosAmbulatoriosList";
import OcupacionesList from "./features/ocupacion/pages/OcupacionesList";
import VisitDashboard from "./features/visit/pages/VisitDashboard";
import IngresoInternacion from "./features/visit/pages/IngresoInternacion";
import IngresoAmbulatorio from "./features/visit/pages/IngresoAmbulatorio";
import VisitantesActivos from "./features/visit/pages/VisitantesActivos";
import Alertas from "./features/visit/pages/Alertas";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AdminRoute from "./features/auth/components/AdminRoute";
import AppLayout from "./shared/components/AppLayout";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/admin/users" element={<AdminRoute />}>
            <Route index element={<UsersList />} />
          </Route>

          <Route path="/admin/personas" element={<PersonasList />} />
          <Route path="/admin/servicios-internacion" element={<ServiciosList />} />
          <Route path="/admin/internacion" element={<CamasList />} />
          <Route path="/admin/servicios-ambulatorios" element={<ServiciosAmbulatoriosList />} />
          <Route path="/admin/ocupacion" element={<OcupacionesList />} />

          <Route path="/porteria" element={<VisitDashboard />} />
          <Route path="/porteria/ingreso-internacion" element={<IngresoInternacion />} />
          <Route path="/porteria/ingreso-ambulatorio" element={<IngresoAmbulatorio />} />
          <Route path="/porteria/visitantes" element={<VisitantesActivos />} />
          <Route path="/porteria/alertas" element={<Alertas />} />
        </Route>
      </Route>
    </Routes>
  );
}
