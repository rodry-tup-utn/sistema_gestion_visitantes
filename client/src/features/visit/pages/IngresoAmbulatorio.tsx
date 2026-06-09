import { useState } from "react";
import { toast } from "sonner";
import { useCrearAccesoAmbulatorio } from "../hooks/useAccesos";
import { useServicios } from "../../admin/servicios-ambulatorios/hooks/useServiciosAmbulatorios";
import { useSearchPersonas } from "../../admin/personas/hooks/usePersonas";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";

export default function IngresoAmbulatorio() {
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [personaEncontrada, setPersonaEncontrada] = useState(false);
  const [buscandoPersona, setBuscandoPersona] = useState(false);
  const [selectedServicioId, setSelectedServicioId] = useState<number | null>(null);
  const [tipoAcceso, setTipoAcceso] = useState("Consulta");

  const { data: searchData } = useSearchPersonas(dni, 0, 5);
  const { data: serviciosData } = useServicios();
  const crear = useCrearAccesoAmbulatorio();

  function handleBuscarPersona() {
    if (!dni || dni.length < 6) {
      toast.error("Ingresá al menos 6 dígitos del DNI");
      return;
    }
    setBuscandoPersona(true);
    const found = searchData?.data.find((p) => p.dni === dni);
    if (found) {
      setNombre(found.nombre);
      setApellido(found.apellido);
      setPersonaEncontrada(true);
      toast.success(`Persona encontrada: ${found.nombre} ${found.apellido}`);
    } else {
      setPersonaEncontrada(false);
      setNombre("");
      setApellido("");
      toast.info("Persona no encontrada. Completá los datos para crearla.");
    }
    setBuscandoPersona(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dni || !nombre || !apellido || !selectedServicioId) {
      toast.error("Completá todos los campos");
      return;
    }
    await crear.mutateAsync({
      persona_dni: dni,
      persona_nombre: nombre,
      persona_apellido: apellido,
      servicio_ambulatorio_id: selectedServicioId,
      tipo_acceso: tipoAcceso,
    });
    toast.success("Ingreso registrado");
    setDni("");
    setNombre("");
    setApellido("");
    setPersonaEncontrada(false);
    setSelectedServicioId(null);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-lg font-bold text-gray-900">Ingreso - Ambulatorio</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Datos de la persona</h2>
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600">DNI</label>
                <input
                  value={dni}
                  onChange={(e) => { setDni(e.target.value); setPersonaEncontrada(false); }}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <Button type="button" variant="secondary" onClick={handleBuscarPersona} loading={buscandoPersona}>
                Buscar
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">Nombre</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  readOnly={personaEncontrada}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${personaEncontrada ? "bg-gray-100 text-gray-500" : "border-gray-300"}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Apellido</label>
                <input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  readOnly={personaEncontrada}
                  className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${personaEncontrada ? "bg-gray-100 text-gray-500" : "border-gray-300"}`}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Servicio ambulatorio</h2>
          <select
            value={selectedServicioId ?? ""}
            onChange={(e) => setSelectedServicioId(Number(e.target.value) || null)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Seleccionar servicio</option>
            {(serviciosData?.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.nombre_servicio}</option>
            ))}
          </select>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Tipo de acceso</h2>
          <select
            value={tipoAcceso}
            onChange={(e) => setTipoAcceso(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="Consulta">Consulta</option>
            <option value="Estudio">Estudio</option>
          </select>
        </Card>

        <Button type="submit" className="w-full" loading={crear.isPending}>
          Registrar Ingreso
        </Button>
      </form>
    </div>
  );
}
