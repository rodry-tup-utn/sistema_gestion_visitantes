import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as svc from "../services/accesos.service";
import type {
  CreateAccesoInternacionPayload,
  CreateAccesoAmbulatorioPayload,
} from "../../../shared/types/visita";

const KEY_INTERNACION = ["accesos-internacion"];
const KEY_AMBULATORIO = ["accesos-ambulatorio"];

export function useAccesosInternacion(offset = 0, limit = 20, activos = true, persona_id?: number) {
  return useQuery({
    queryKey: [...KEY_INTERNACION, { offset, limit, activos, persona_id }],
    queryFn: () => svc.getAccesosInternacion(offset, limit, activos, persona_id),
  });
}

export function useSearchAccesosInternacion(query: string, offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...KEY_INTERNACION, "search", { query, offset, limit }],
    queryFn: () => svc.searchAccesosInternacion(query, offset, limit),
    enabled: query.length >= 2,
  });
}

export function useCrearAccesoInternacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccesoInternacionPayload) => svc.crearAccesoInternacion(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_INTERNACION });
    },
  });
}

export function useFinalizarAccesoInternacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svc.finalizarAccesoInternacion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_INTERNACION });
    },
  });
}

export function useAccesosAmbulatorio(offset = 0, limit = 20, activos = true, persona_id?: number) {
  return useQuery({
    queryKey: [...KEY_AMBULATORIO, { offset, limit, activos, persona_id }],
    queryFn: () => svc.getAccesosAmbulatorio(offset, limit, activos, persona_id),
  });
}

export function useSearchAccesosAmbulatorio(query: string, offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...KEY_AMBULATORIO, "search", { query, offset, limit }],
    queryFn: () => svc.searchAccesosAmbulatorio(query, offset, limit),
    enabled: query.length >= 2,
  });
}

export function useCrearAccesoAmbulatorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAccesoAmbulatorioPayload) => svc.crearAccesoAmbulatorio(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_AMBULATORIO });
    },
  });
}

export function useFinalizarAccesoAmbulatorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svc.finalizarAccesoAmbulatorio(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_AMBULATORIO });
    },
  });
}

const KEY_VENCIDOS = ["accesos-vencidos"];

export function useAccesosVencidos(offset = 0, limit = 50) {
  return useQuery({
    queryKey: [...KEY_VENCIDOS, { offset, limit }],
    queryFn: () => svc.getAccesosVencidos(offset, limit),
    refetchInterval: 30_000,
  });
}

export function useRenovarAccesoInternacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svc.renovarAccesoInternacion(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_VENCIDOS });
      qc.invalidateQueries({ queryKey: KEY_INTERNACION });
    },
  });
}

const KEY_ACTIVOS = ["activos"];

export function useActivos(
  query?: string,
  dni?: string,
  tipo_acceso?: string,
  offset = 0,
  limit = 50,
) {
  return useQuery({
    queryKey: [...KEY_ACTIVOS, { query, dni, tipo_acceso, offset, limit }],
    queryFn: () => svc.getActivos(offset, limit, query, dni, tipo_acceso),
    refetchInterval: 30_000,
  });
}

export function useRenovarAccesoAmbulatorio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => svc.renovarAccesoAmbulatorio(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_VENCIDOS });
      qc.invalidateQueries({ queryKey: KEY_AMBULATORIO });
    },
  });
}
