import { useState } from "react";
import { User, Search, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreatePersona } from "../../personas/hooks/usePersonas";
import { getPersonaByDni } from "../../personas/services/personas.service";
import PersonaForm from "../../personas/components/PersonaForm";
import { getCamas } from "../../camas/services/camas.service";
import type { Cama } from "../../../shared/types/internacion";
import type {
  Persona,
  CreatePersonaPayload,
} from "../../../shared/types/persona";
import Modal from "../../../shared/components/Modal";
import Spinner from "../../../shared/components/Spinner";
import Button from "../../../shared/components/Button";
import Badge from "../../../shared/components/Badge";

interface AdmitirFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    persona_id: number;
    internacion_id: number;
  }) => Promise<void>;
}

export default function AdmitirForm({
  isOpen,
  onClose,
  onSubmit,
}: AdmitirFormProps) {
  const [step, setStep] = useState<"persona" | "cama">("persona");
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCamaId, setSelectedCamaId] = useState<number | null>(null);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [loadingCamas, setLoadingCamas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [camaSearch, setCamaSearch] = useState("");
  const [dniSearch, setDniSearch] = useState("");
  const [searchingDni, setSearchingDni] = useState(false);
  const [showCreatePersona, setShowCreatePersona] = useState(false);

  const createPersona = useCreatePersona();

  function loadCamas(query?: string) {
    setLoadingCamas(true);
    const q = query && query.length >= 2 ? query : undefined;
    getCamas(0, 50, q, undefined, "Disponible")
      .then((res) => setCamas(res.data))
      .finally(() => setLoadingCamas(false));
  }

  function handleSelectPersona(p: Persona) {
    setSelectedPersona(p);
    setStep("cama");
    loadCamas();
  }

  function handleCamaSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setCamaSearch(v);
    loadCamas(v);
  }

  async function handleBuscarDni() {
    if (dniSearch.length < 6) {
      toast.error("Ingresá al menos 6 dígitos del DNI");
      return;
    }
    setSearchingDni(true);
    try {
      const found = await getPersonaByDni(dniSearch);
      handleSelectPersona(found);
      toast.success(`${found.nombre} ${found.apellido} encontrado`);
    } catch {
      setShowCreatePersona(true);
    } finally {
      setSearchingDni(false);
    }
  }

  async function handleCreatePersona(data: CreatePersonaPayload) {
    const created = await createPersona.mutateAsync(data);
    handleSelectPersona(created);
    setShowCreatePersona(false);
    toast.success("Persona creada exitosamente");
  }

  async function handleSubmit() {
    if (!selectedPersona || !selectedCamaId) return;
    setSubmitting(true);
    await onSubmit({
      persona_id: selectedPersona.id,
      internacion_id: selectedCamaId,
    });
    setSubmitting(false);
    onClose();
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Admitir Paciente"
        className="max-w-xl"
      >
        {step === "persona" ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <User size={28} />
              </div>
              <p className="text-center text-sm text-muted">
                Ingresá el DNI para buscar a la persona o crear una nueva si no
                existe
              </p>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-teal-700">
                  DNI
                </label>
                <input
                  value={dniSearch}
                  minLength={6}
                  onChange={(e) => setDniSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscarDni()}
                  placeholder="Ingresá el DNI..."
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleBuscarDni}
                loading={searchingDni}
              >
                <Search size={16} />
                Buscar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                  <User size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900">
                    {selectedPersona?.nombre} {selectedPersona?.apellido}
                  </p>
                  <p className="text-sm text-teal-700">
                    DNI: {selectedPersona?.dni}
                  </p>
                </div>
                <Badge variant="success">Verificada</Badge>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-700">
                Cama disponible
              </label>
              <input
                value={camaSearch}
                onChange={handleCamaSearchChange}
                placeholder="Buscar por sala, cama o servicio..."
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {loadingCamas ? (
              <Spinner />
            ) : (
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {camas.length === 0 ? (
                  <p className="text-sm text-muted">No hay camas disponibles</p>
                ) : (
                  camas.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCamaId(c.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                        selectedCamaId === c.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          selectedCamaId === c.id
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <User size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">
                          {c.servicio_nombre_cache}
                        </p>
                        <p className="text-xs text-muted">
                          Sala {c.sala} - Cama {c.cama}
                        </p>
                      </div>
                      {selectedCamaId === c.id && (
                        <CheckCircle
                          size={18}
                          className="shrink-0 text-blue-600"
                        />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedCamaId}
              loading={submitting}
            >
              <ArrowRight size={16} />
              Confirmar Admisión
            </Button>
          </div>
        )}
      </Modal>

      <PersonaForm
        key={dniSearch}
        isOpen={showCreatePersona}
        onClose={() => setShowCreatePersona(false)}
        title="Nueva Persona"
        initialData={{ dni: dniSearch } as Persona}
        onSubmit={handleCreatePersona}
      />
    </>
  );
}
