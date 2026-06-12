import api from "../../../shared/services/api";
import type {
  AccesoInternacionPaginated,
  AccesoInternacion,
  CreateAccesoInternacionPayload,
  AccesoAmbulatorioPaginated,
  AccesoAmbulatorio,
  CreateAccesoAmbulatorioPayload,
  AccesoVencidoList,
  AccesoActivoList,
} from "../../../shared/types/visita";

export function getAccesosInternacion(offset = 0, limit = 20, activos = true, persona_id?: number): Promise<AccesoInternacionPaginated> {
  const params: Record<string, string | number | boolean> = { offset, limit, activos };
  if (persona_id !== undefined) params.persona_id = persona_id;
  return api.get("/visit/accesos-internacion", { params }).then((r) => r.data);
}

export function searchAccesosInternacion(query: string, offset = 0, limit = 20): Promise<AccesoInternacionPaginated> {
  return api.get("/visit/accesos-internacion", { params: { query, offset, limit, activos: false } }).then((r) => r.data);
}

export function crearAccesoInternacion(data: CreateAccesoInternacionPayload): Promise<AccesoInternacion> {
  return api.post("/visit/ingreso-internacion", data).then((r) => r.data);
}

export function finalizarAccesoInternacion(id: number): Promise<AccesoInternacion> {
  return api.patch(`/visit/acceso-internacion/${id}/finalizar`).then((r) => r.data);
}

export function getAccesosAmbulatorio(offset = 0, limit = 20, activos = true, persona_id?: number): Promise<AccesoAmbulatorioPaginated> {
  const params: Record<string, string | number | boolean> = { offset, limit, activos };
  if (persona_id !== undefined) params.persona_id = persona_id;
  return api.get("/visit/accesos-ambulatorio", { params }).then((r) => r.data);
}

export function searchAccesosAmbulatorio(query: string, offset = 0, limit = 20): Promise<AccesoAmbulatorioPaginated> {
  return api.get("/visit/accesos-ambulatorio", { params: { query, offset, limit, activos: false } }).then((r) => r.data);
}

export function crearAccesoAmbulatorio(data: CreateAccesoAmbulatorioPayload): Promise<AccesoAmbulatorio> {
  return api.post("/visit/ingreso-ambulatorio", data).then((r) => r.data);
}

export function finalizarAccesoAmbulatorio(id: number): Promise<AccesoAmbulatorio> {
  return api.patch(`/visit/acceso-ambulatorio/${id}/finalizar`).then((r) => r.data);
}

export function getAccesosVencidos(offset = 0, limit = 50): Promise<AccesoVencidoList> {
  return api.get("/visit/accesos-vencidos", { params: { offset, limit } }).then((r) => r.data);
}

export function renovarAccesoInternacion(id: number): Promise<AccesoInternacion> {
  return api.patch(`/visit/acceso-internacion/${id}/renovar`).then((r) => r.data);
}

export function renovarAccesoAmbulatorio(id: number): Promise<AccesoAmbulatorio> {
  return api.patch(`/visit/acceso-ambulatorio/${id}/renovar`).then((r) => r.data);
}

export function getActivos(
  offset = 0,
  limit = 50,
  query?: string,
  dni?: string,
  tipo_acceso?: string,
): Promise<AccesoActivoList> {
  const params: Record<string, string | number> = { offset, limit };
  if (query) params.query = query;
  if (dni) params.dni = dni;
  if (tipo_acceso) params.tipo_acceso = tipo_acceso;
  return api.get("/visit/activos", { params }).then((r) => r.data);
}
