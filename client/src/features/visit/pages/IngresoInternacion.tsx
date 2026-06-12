import { useState } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useCrearAccesoInternacion } from "../hooks/useAccesos";
import { getPersonaByDni } from "../../personas/services/personas.service";
import { useCreatePersona } from "../../personas/hooks/usePersonas";
import PersonaForm from "../../personas/components/PersonaForm";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import Spinner from "../../../shared/components/Spinner";
import { useNavigate } from "react-router-dom";
import {
  useOcupaciones,
  useSearchOcupaciones,
} from "../../ocupacion/hooks/useOcupaciones";
import type { Persona } from "../../../shared/types/persona";
import type { TipoAcceso } from "../../../shared/types/visita";

export default function IngresoInternacion() {
  const [dni, setDni] = useState("");
  const [persona, setPersona] = useState<{
    nombre: string;
    apellido: string;
    encontrada: boolean;
  }>({ nombre: "", apellido: "", encontrada: false });
  const [selectedOcupacionId, setSelectedOcupacionId] = useState<number | null>(
    null,
  );
  const [tipoAcceso, setTipoAcceso] = useState<TipoAcceso>("Visita Estandar");
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: ocupacionesData, isLoading } = useOcupaciones(0, 10, true);
  const { data: searchPacientesData, isLoading: searchPacientesLoading } =
    useSearchOcupaciones(pacienteSearch, 0, 20, true);

  const isSearchingPaciente = pacienteSearch.length >= 2;
  const pacientesList = isSearchingPaciente
    ? searchPacientesData
    : ocupacionesData;

  function handlePacienteSearchChange(value: string) {
    setPacienteSearch(value);
    setSelectedOcupacionId(null);
  }
  const crear = useCrearAccesoInternacion();
  const createPersona = useCreatePersona();
  const navigate = useNavigate();

  async function handleBuscarPersona() {
    if (dni.length < 6) {
      toast.error("Ingresá al menos 6 dígitos del DNI");
      return;
    }
    setSearching(true);
    try {
      const found = await getPersonaByDni(dni);
      setPersona({
        nombre: found.nombre,
        apellido: found.apellido,
        encontrada: true,
      });
      toast.success(`Persona encontrada: ${found.nombre} ${found.apellido}`);
    } catch {
      setPersona({ nombre: "", apellido: "", encontrada: false });
      setShowCreateModal(true);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dni || !persona.nombre || !persona.apellido || !selectedOcupacionId) {
      toast.error("Completá todos los campos");
      return;
    }
    try {
      await crear.mutateAsync({
        persona_dni: dni,
        persona_nombre: persona.nombre,
        persona_apellido: persona.apellido,
        ocupacion_paciente_id: selectedOcupacionId,
        tipo_acceso: tipoAcceso,
      });
      toast.success("Ingreso registrado");
      setDni("");
      setPersona({ nombre: "", apellido: "", encontrada: false });
      setSelectedOcupacionId(null);
      navigate("/porteria/visitantes");
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail ?? "Error al registrar ingreso"
        : "Error al registrar ingreso";
      toast.error(msg);
    }
  }

  async function handleCreatePersona(data: Parameters<typeof createPersona.mutateAsync>[0]) {
    await createPersona.mutateAsync(data);
    setPersona({ nombre: data.nombre, apellido: data.apellido, encontrada: true });
    setShowCreateModal(false);
    toast.success("Persona creada exitosamente");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-lg font-bold text-gray-900">
        Ingreso - Internación
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Visitante
          </h2>
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600">
                  DNI
                </label>
                <input
                  value={dni}
                  minLength={6}
                  onChange={(e) => {
                    setDni(e.target.value);
                    setPersona({ nombre: "", apellido: "", encontrada: false });
                  }}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleBuscarPersona}
                loading={searching}
              >
                Buscar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Nombre
                </label>
                <input
                  value={persona.nombre}
                  onChange={(e) =>
                    setPersona({ ...persona, nombre: e.target.value })
                  }
                  readOnly={persona.encontrada}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${persona.encontrada ? "bg-gray-100 text-gray-500" : "border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Apellido
                </label>
                <input
                  value={persona.apellido}
                  onChange={(e) =>
                    setPersona({ ...persona, apellido: e.target.value })
                  }
                  readOnly={persona.encontrada}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${persona.encontrada ? "bg-gray-100 text-gray-500" : "border-gray-300"}`}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Paciente internado
          </h2>
          <input
            value={pacienteSearch}
            onChange={(e) => handlePacienteSearchChange(e.target.value)}
            placeholder="Buscar paciente por nombre..."
            className="mb-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {isLoading || searchPacientesLoading ? (
            <Spinner />
          ) : !pacientesList?.data.length ? (
            <p className="text-sm text-muted">No hay pacientes internados</p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {pacientesList.data.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${selectedOcupacionId === o.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                >
                  <input
                    type="radio"
                    name="ocupacion"
                    checked={selectedOcupacionId === o.id}
                    onChange={() => setSelectedOcupacionId(o.id)}
                    className="accent-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {o.paciente_nombre_cache}
                    </p>
                    <p className="text-xs text-muted">{o.ubicacion_cache}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Tipo de acceso
          </h2>
          <select
            value={tipoAcceso}
            onChange={(e) => setTipoAcceso(e.target.value as TipoAcceso)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="Visita Estandar">Visita Estándar</option>
            <option value="Cuidador">Cuidador</option>
            <option value="Urgencia">Urgencia</option>
          </select>
        </Card>

        <Button type="submit" className="w-full" loading={crear.isPending}>
          Registrar Ingreso
        </Button>
      </form>

      <PersonaForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Persona"
        initialData={{ dni } as Persona}
        onSubmit={handleCreatePersona}
      />
    </div>
  );
}
