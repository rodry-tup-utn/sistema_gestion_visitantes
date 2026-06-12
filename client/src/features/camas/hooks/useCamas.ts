import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/camas.service";
import type { CreateCamaPayload } from "../../../shared/types/internacion";

const KEY = ["camas"];

export function useCamas(offset = 0, limit = 20, servicio_id?: number, estado_disponibilidad?: string) {
  return useQuery({
    queryKey: [...KEY, { offset, limit, servicio_id, estado_disponibilidad }],
    queryFn: () => svc.getCamas(offset, limit, undefined, servicio_id, estado_disponibilidad),
  });
}

export function useSearchCamas(query: string, offset = 0, limit = 20, servicio_id?: number, estado_disponibilidad?: string) {
  return useQuery({
    queryKey: [...KEY, "search", { query, offset, limit, servicio_id, estado_disponibilidad }],
    queryFn: () => svc.getCamas(offset, limit, query, servicio_id, estado_disponibilidad),
    enabled: query.length >= 2,
  });
}

export function useCreateCama() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreateCamaPayload) => svc.createCama(data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}

export function useUpdateCama() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<CreateCamaPayload> }) => svc.updateCama(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
