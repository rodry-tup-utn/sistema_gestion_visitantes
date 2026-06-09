import { useState } from "react";
import Modal from "../../../shared/components/Modal";
import Spinner from "../../../shared/components/Spinner";
import { useCamas, useSearchCamas } from "../../camas/hooks/useCamas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (internacion_id: number) => Promise<void>;
  pacienteNombre: string;
}

export default function CambiarCamaModal({
  isOpen,
  onClose,
  onSubmit,
  pacienteNombre,
}: Props) {
  const [camaSearch, setCamaSearch] = useState("");
  const [selectedCamaId, setSelectedCamaId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: camasData, isLoading } = useCamas(0, 50, undefined, "Disponible");
  const { data: searchData, isLoading: searchLoading } = useSearchCamas(
    camaSearch,
    0,
    50,
    undefined,
    "Disponible",
  );

  const isSearching = camaSearch.length >= 2;
  const camas = isSearching ? searchData?.data : camasData?.data;

  function handleCancel() {
    setCamaSearch("");
    setSelectedCamaId(null);
    onClose();
  }

  async function handleConfirm() {
    if (!selectedCamaId) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedCamaId);
      setCamaSearch("");
      setSelectedCamaId(null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`Cambiar cama - ${pacienteNombre}`}
      footer={
        <div className="flex w-full gap-2">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedCamaId || submitting}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Cambiando..." : "Cambiar cama"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <input
          value={camaSearch}
          onChange={(e) => setCamaSearch(e.target.value)}
          placeholder="Buscar por servicio, sala o cama..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />

        {isLoading || searchLoading ? (
          <Spinner />
        ) : !camas?.length ? (
          <p className="py-4 text-center text-sm text-muted">
            No hay camas disponibles
          </p>
        ) : (
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {camas.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCamaId(c.id)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                  selectedCamaId === c.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">
                  {c.servicio_nombre_cache}
                </p>
                <p className="text-xs text-muted">
                  Sala {c.sala} - Cama {c.cama}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
