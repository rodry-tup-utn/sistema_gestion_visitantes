export interface Persona {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PersonaPaginated {
  data: Persona[];
  total: number;
}

export interface CreatePersonaPayload {
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  role?: string;
}
