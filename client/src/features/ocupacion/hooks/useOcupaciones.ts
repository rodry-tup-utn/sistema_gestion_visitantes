import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import * as svc from "../services/ocupacion.service";
import type {
  AdmitirPayload,
  CambiarCamaPayload,
  OcupacionPacientePaginated,
} from "../../../shared/types/internacion";

const KEY = ["ocupaciones"];

export function useOcupaciones(
  offset = 0,
  limit = 20,
  activos = true,
): UseQueryResult<OcupacionPacientePaginated> {
  return useQuery({
    queryKey: [...KEY, { offset, limit, activos }],
    queryFn: () => svc.getOcupaciones(offset, limit, activos),
  });
}

export function useSearchOcupaciones(
  query: string,
  offset = 0,
  limit = 20,
  solo_activos = false,
) {
  return useQuery({
    queryKey: [...KEY, "search", { query, offset, limit, solo_activos }],
    queryFn: () => svc.searchOcupaciones(query, offset, limit, solo_activos),
    enabled: query.length >= 2,
  });
}

export function useAdmitir() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmitirPayload) => svc.admitirPaciente(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["camas"] });
      qc.invalidateQueries({ queryKey: KEY });
    },
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

export function useCambiarCama() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambiarCamaPayload }) =>
      svc.cambiarCama(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: ["camas"] });
    },
  });
}
