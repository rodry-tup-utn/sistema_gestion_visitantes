export interface ServicioInternacion {
  id: number;
  nombre_servicio: string;
  bloque_piso: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ServicioInternacionPaginated {
  data: ServicioInternacion[];
  total: number;
}

export interface CreateServicioInternacionPayload {
  nombre_servicio: string;
  bloque_piso: string | null;
}

export interface Cama {
  id: number;
  servicio_internacion_id: number;
  servicio_nombre_cache: string;
  sala: string;
  cama: string;
  estado_disponibilidad: string;
  created_at: string;
  updated_at: string | null;
}

export interface CamaPaginated {
  data: Cama[];
  total: number;
}

export interface CreateCamaPayload {
  servicio_internacion_id: number;
  sala: string;
  cama: string;
  estado_disponibilidad?: string;
}

export interface ServicioAmbulatorio {
  id: number;
  nombre_servicio: string;
  ubicacion_interna: string | null;
  estado: string;
  created_at: string;
  updated_at: string | null;
}

export interface ServicioAmbulatorioPaginated {
  data: ServicioAmbulatorio[];
  total: number;
}

export interface CreateServicioAmbulatorioPayload {
  nombre_servicio: string;
  ubicacion_interna: string | null;
  estado?: string;
}

export interface OcupacionPaciente {
  id: number;
  persona_id: number;
  internacion_id: number;
  paciente_nombre_cache: string;
  ubicacion_cache: string;
  fecha_ingreso: string;
  fecha_alta: string | null;
  estado: string;
}

export interface OcupacionPacientePaginated {
  data: OcupacionPaciente[];
  total: number;
}

export interface AdmitirPayload {
  persona_id: number;
  internacion_id: number;
}
