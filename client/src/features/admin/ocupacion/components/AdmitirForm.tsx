import { useState, useEffect } from "react";
import Modal from "../../../../shared/components/Modal";
import Spinner from "../../../../shared/components/Spinner";
import { usePersonas } from "../../personas/hooks/usePersonas";
import { getCamas } from "../../camas/services/camas.service";
import type { Cama, Persona } from "../../../../shared/types";

interface AdmitirFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { persona_id: number; internacion_id: number }) => Promise<void>;
}

export default function AdmitirForm({ isOpen, onClose, onSubmit }: AdmitirFormProps) {
  const [step, setStep] = useState<"persona" | "cama">("persona");
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedCamaId, setSelectedCamaId] = useState<number | null>(null);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [loadingCamas, setLoadingCamas] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const { data: personasData } = usePersonas(0, 50);

  const personas = personasData?.data ?? [];
  const filtered = search.length >= 2
    ? personas.filter((p) => p.apellido.toLowerCase().includes(search.toLowerCase()) || p.nombre.toLowerCase().includes(search.toLowerCase()) || p.dni.includes(search))
    : personas;

  useEffect(() => {
    if (isOpen) {
      setStep("persona");
      setSelectedPersona(null);
      setSelectedCamaId(null);
      setSearch("");
      setCamas([]);
    }
  }, [isOpen]);

  function selectPersona(p: Persona) {
    setSelectedPersona(p);
    setStep("cama");
    setLoadingCamas(true);
    getCamas(0, 200, undefined, undefined, "Disponible")
      .then((res) => setCamas(res.data))
      .finally(() => setLoadingCamas(false));
  }

  async function handleSubmit() {
    if (!selectedPersona || !selectedCamaId) return;
    setSubmitting(true);
    await onSubmit({ persona_id: selectedPersona.id, internacion_id: selectedCamaId });
    setSubmitting(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admitir Paciente">
      {step === "persona" ? (
        <div className="space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, nombre o apellido..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPersona(p)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100"
              >
                <span className="font-medium">{p.apellido}, {p.nombre}</span>
                <span className="ml-2 text-muted">DNI: {p.dni}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Paciente: <span className="font-medium text-gray-900">{selectedPersona?.apellido}, {selectedPersona?.nombre}</span>
          </p>
          {loadingCamas ? (
            <Spinner />
          ) : (
            <select
              value={selectedCamaId ?? ""}
              onChange={(e) => setSelectedCamaId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Seleccionar cama disponible...</option>
              {camas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.servicio_nombre_cache} - Sala {c.sala} - Cama {c.cama}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleSubmit}
            disabled={!selectedCamaId || submitting}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Admitiendo..." : "Confirmar Admisión"}
          </button>
        </div>
      )}
    </Modal>
  );
}
