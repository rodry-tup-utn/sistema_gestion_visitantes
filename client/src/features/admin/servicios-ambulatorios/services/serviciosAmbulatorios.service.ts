import api from "../../../../shared/services/api";
import type { ServicioAmbulatorioPaginated, ServicioAmbulatorio, CreateServicioAmbulatorioPayload } from "../../../../shared/types/internacion";

export function getServicios(offset = 0, limit = 20): Promise<ServicioAmbulatorioPaginated> {
  return api.get("/admin/servicio-ambulatorio", { params: { offset, limit } }).then((r) => r.data);
}

export function searchServicios(query: string, offset = 0, limit = 20): Promise<ServicioAmbulatorioPaginated> {
  return api.get("/admin/servicio-ambulatorio", { params: { query, offset, limit } }).then((r) => r.data);
}

export function createServicio(data: CreateServicioAmbulatorioPayload): Promise<ServicioAmbulatorio> {
  return api.post("/admin/servicio-ambulatorio", data).then((r) => r.data);
}

export function updateServicio(id: number, data: Partial<CreateServicioAmbulatorioPayload>): Promise<ServicioAmbulatorio> {
  return api.patch(`/admin/servicio-ambulatorio/${id}`, data).then((r) => r.data);
}
