import { useState } from "react";
import Modal from "../../../../shared/components/Modal";
import Spinner from "../../../../shared/components/Spinner";

import type { Cama } from "../../../../shared/types/internacion";
import type { Persona } from "../../../../shared/types/persona";
import {
  usePersonas,
  useSearchPersonas,
} from "../../../personas/hooks/usePersonas";
import { getCamas } from "../../../camas/services/camas.service";

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
  const [search, setSearch] = useState("");
  const [camaSearch, setCamaSearch] = useState("");
  const { data: allData } = usePersonas(0, 50);
  const { data: searchData } = useSearchPersonas({ query: search, limit: 50 });

  const isSearching = search.length >= 2;
  const personas = isSearching
    ? (searchData?.data ?? [])
    : (allData?.data ?? []);

  function loadCamas(query?: string) {
    setLoadingCamas(true);
    const q = query && query.length >= 2 ? query : undefined;
    getCamas(0, 50, q, undefined, "Disponible")
      .then((res) => setCamas(res.data))
      .finally(() => setLoadingCamas(false));
  }

  function selectPersona(p: Persona) {
    setSelectedPersona(p);
    setCamaSearch("");
    setStep("cama");
    loadCamas();
  }

  function handleCamaSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setCamaSearch(v);
    loadCamas(v);
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
            {personas.map((p: Persona) => (
              <button
                key={p.id}
                onClick={() => selectPersona(p)}
                className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-100"
              >
                <span className="font-medium">
                  {p.apellido}, {p.nombre}
                </span>
                <span className="ml-2 text-muted">DNI: {p.dni}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Paciente:{" "}
            <span className="font-medium text-gray-900">
              {selectedPersona?.apellido}, {selectedPersona?.nombre}
            </span>
          </p>
          <input
            value={camaSearch}
            onChange={handleCamaSearchChange}
            placeholder="Buscar cama por sala, cama o servicio..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          {loadingCamas ? (
            <Spinner />
          ) : (
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {camas.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCamaId(c.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedCamaId === c.id
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium">{c.servicio_nombre_cache}</span>
                  <span className="ml-2 text-muted">
                    Sala {c.sala} - Cama {c.cama}
                  </span>
                </button>
              ))}
            </div>
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
