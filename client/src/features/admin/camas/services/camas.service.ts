import api from "../../../../shared/services/api";
import type {
  CamaPaginated,
  Cama,
  CreateCamaPayload,
} from "../../../../shared/types/internacion";

export async function getCamas(
  offset = 0,
  limit = 20,
  query?: string,
  servicio_id?: number,
  estado_disponibilidad?: string,
): Promise<CamaPaginated> {
  const params: Record<string, string | number> = { offset, limit };
  if (query) params.query = query;
  if (servicio_id !== undefined) params.servicio_id = servicio_id;
  if (estado_disponibilidad)
    params.estado_disponibilidad = estado_disponibilidad;
  return api.get("/admin/internacion", { params }).then((r) => r.data);
}

export function createCama(data: CreateCamaPayload): Promise<Cama> {
  return api.post("/admin/internacion", data).then((r) => r.data);
}

export async function updateCama(
  id: number,
  data: Partial<CreateCamaPayload>,
): Promise<Cama> {
  return api.patch(`/admin/internacion/${id}`, data).then((r) => r.data);
}
