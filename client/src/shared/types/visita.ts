export type TipoAcceso =
  | "Visita Estandar"
  | "Cuidador"
  | "Urgencia"
  | "Consulta"
  | "Estudio";

export const TIEMPOS_ACCESO: Record<TipoAcceso, number> = {
  "Visita Estandar": 120,
  Cuidador: 720,
  Urgencia: 45,
  Consulta: 120,
  Estudio: 120,
};

export interface AccesoInternacion {
  id: number;
  persona_id: number;
  ocupacion_paciente_id: number;
  internacion_id: number;
  tipo_acceso: TipoAcceso;
  fecha_ingreso: string;
  fecha_salida: string | null;
  estado: string;
  persona_nombre_cache: string;
  paciente_nombre_cache: string;
  ubicacion_cache: string;
  minutos_transcurridos?: number;
  vencido?: boolean;
}

export interface AccesoInternacionPaginated {
  data: AccesoInternacion[];
  total: number;
}

export interface CreateAccesoInternacionPayload {
  persona_dni: string;
  persona_nombre: string;
  persona_apellido: string;
  ocupacion_paciente_id: number;
  tipo_acceso: TipoAcceso;
}

export interface AccesoAmbulatorio {
  id: number;
  persona_id: number;
  servicio_ambulatorio_id: number;
  tipo_acceso: TipoAcceso;
  fecha_ingreso: string;
  fecha_salida: string | null;
  estado: string;
  persona_nombre_cache: string;
  servicio_nombre_cache: string;
  minutos_transcurridos?: number;
  vencido?: boolean;
}

export interface AccesoAmbulatorioPaginated {
  data: AccesoAmbulatorio[];
  total: number;
}

export interface CreateAccesoAmbulatorioPayload {
  persona_dni: string;
  persona_nombre: string;
  persona_apellido: string;
  servicio_ambulatorio_id: number;
  tipo_acceso: TipoAcceso;
}

export interface AccesoVencidoItem {
  id: number;
  tipo: "internacion" | "ambulatorio";
  persona_nombre_cache: string;
  destino_cache: string;
  tipo_acceso: TipoAcceso;
  fecha_ingreso: string;
  minutos_transcurridos: number;
}

export interface AccesoVencidoList {
  data: AccesoVencidoItem[];
  total: number;
}

export interface AccesoActivoItem {
  id: number;
  tipo: "internacion" | "ambulatorio";
  persona_nombre_cache: string;
  persona_dni: string;
  destino_cache: string;
  tipo_acceso: TipoAcceso;
  fecha_ingreso: string;
  minutos_transcurridos: number;
  vencido: boolean;
}

export interface AccesoActivoList {
  data: AccesoActivoItem[];
  total: number;
}
