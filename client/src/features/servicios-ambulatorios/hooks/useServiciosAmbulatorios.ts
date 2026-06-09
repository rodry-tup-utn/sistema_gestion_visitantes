import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/serviciosAmbulatorios.service";
import type { CreateServicioAmbulatorioPayload } from "../../shared/types/internacion";

const KEY = ["servicios-ambulatorios"];

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
  return useMutation({ mutationFn: (data: CreateServicioAmbulatorioPayload) => svc.createServicio(data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}

export function useUpdateServicio() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: number; data: Partial<CreateServicioAmbulatorioPayload> }) => svc.updateServicio(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}
