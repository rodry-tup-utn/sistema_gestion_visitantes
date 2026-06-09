import api from "../../../../shared/services/api";
import type { ServicioInternacionPaginated, ServicioInternacion, CreateServicioInternacionPayload } from "../../../../shared/types/internacion";

export function getServicios(offset = 0, limit = 20): Promise<ServicioInternacionPaginated> {
  return api.get("/admin/servicio-internacion", { params: { offset, limit } }).then((r) => r.data);
}

export function searchServicios(query: string, offset = 0, limit = 20): Promise<ServicioInternacionPaginated> {
  return api.get("/admin/servicio-internacion", { params: { query, offset, limit } }).then((r) => r.data);
}

export function createServicio(data: CreateServicioInternacionPayload): Promise<ServicioInternacion> {
  return api.post("/admin/servicio-internacion", data).then((r) => r.data);
}

export function updateServicio(id: number, data: Partial<CreateServicioInternacionPayload>): Promise<ServicioInternacion> {
  return api.patch(`/admin/servicio-internacion/${id}`, data).then((r) => r.data);
}
