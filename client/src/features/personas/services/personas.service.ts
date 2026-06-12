import api from "../../../shared/services/api";
import type {
  CreatePersonaPayload,
  Persona,
  PersonaPaginated,
} from "../../../shared/types/persona";

export async function getPersonas(
  offset = 0,
  limit = 20,
): Promise<PersonaPaginated> {
  return api
    .get("/admin/persona", { params: { offset, limit } })
    .then((r) => r.data);
}

export async function getPersonaByDni(dni: string): Promise<Persona> {
  return api.get(`/admin/persona/dni/${dni}`).then((r) => r.data);
}

export async function searchPersonas(
  params: { query?: string; dni?: string; offset?: number; limit?: number },
): Promise<PersonaPaginated> {
  return api.get("/admin/persona", { params }).then((r) => r.data);
}

export async function createPersona(
  data: CreatePersonaPayload,
): Promise<Persona> {
  return api.post("/admin/persona", data).then((r) => r.data);
}

export async function updatePersona(
  id: number,
  data: Partial<CreatePersonaPayload>,
): Promise<Persona> {
  return api.patch(`/admin/persona/${id}`, data).then((r) => r.data);
}
