import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/personas.service";
import type { CreatePersonaPayload } from "../../../../shared/types/persona";

const KEY = ["personas"];

export function usePersonas(offset = 0, limit = 20) {
  return useQuery({ queryKey: [...KEY, { offset, limit }], queryFn: () => svc.getPersonas(offset, limit) });
}

export function useSearchPersonas(query: string, offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...KEY, "search", { query, offset, limit }],
    queryFn: () => svc.searchPersonas(query, offset, limit),
    enabled: query.length >= 2,
  });
}

export function useCreatePersona() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreatePersonaPayload) => svc.createPersona(data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}

export function useUpdatePersona() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<CreatePersonaPayload> }) => svc.updatePersona(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
