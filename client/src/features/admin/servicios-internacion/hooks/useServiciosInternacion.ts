import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/serviciosInternacion.service";
import type { CreateServicioInternacionPayload } from "../../../../shared/types/internacion";

const KEY = ["servicios-internacion"];

export function useServicios(offset = 0, limit = 20) {
  return useQuery({ queryKey: [...KEY, { offset, limit }], queryFn: () => svc.getServicios(offset, limit) });
}

export function useSearchServicios(query: string, offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...KEY, "search", { query, offset, limit }],
    queryFn: () => svc.searchServicios(query, offset, limit),
    enabled: query.length >= 2,
  });
}

export function useCreateServicio() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreateServicioInternacionPayload) => svc.createServicio(data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}

export function useUpdateServicio() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<CreateServicioInternacionPayload> }) => svc.updateServicio(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
