import api from "../../../../shared/services/api";
import type { OcupacionPacientePaginated, OcupacionPaciente, AdmitirPayload } from "../../../../shared/types/internacion";

export function getOcupaciones(offset = 0, limit = 20, activos = true): Promise<OcupacionPacientePaginated> {
  return api.get("/admin/ocupacion", { params: { offset, limit, solo_activos: activos } }).then((r) => r.data);
}

export function searchOcupaciones(query: string, offset = 0, limit = 20): Promise<OcupacionPacientePaginated> {
  return api.get("/admin/ocupacion", { params: { query, offset, limit, solo_activos: false } }).then((r) => r.data);
}

export function admitirPaciente(data: AdmitirPayload): Promise<OcupacionPaciente> {
  return api.post("/admin/ocupacion/admitir", data).then((r) => r.data);
}

export function darAlta(id: number): Promise<OcupacionPaciente> {
  return api.patch(`/admin/ocupacion/${id}/alta`).then((r) => r.data);
}

export function registrarFallecimiento(id: number): Promise<OcupacionPaciente> {
  return api.patch(`/admin/ocupacion/${id}/fallecido`).then((r) => r.data);
}
