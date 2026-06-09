import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/ocupacion.service";
import type { AdmitirPayload } from "../../../../shared/types/internacion";

const KEY = ["ocupaciones"];

export function useOcupaciones(offset = 0, limit = 20, activos = true) {
  return useQuery({
    queryKey: [...KEY, { offset, limit, activos }],
    queryFn: () => svc.getOcupaciones(offset, limit, activos),
  });
}

export function useSearchOcupaciones(query: string, offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...KEY, "search", { query, offset, limit }],
    queryFn: () => svc.searchOcupaciones(query, offset, limit),
    enabled: query.length >= 2,
  });
}

export function useAdmitir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmitirPayload) => svc.admitirPaciente(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, "camas"] }),
  });
}

export function useDarAlta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svc.darAlta(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRegistrarFallecimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svc.registrarFallecimiento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
