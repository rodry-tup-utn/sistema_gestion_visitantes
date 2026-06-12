import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import { useForm } from "../../../shared/hooks/useForm";
import type {
  CreateServicioInternacionPayload,
  ServicioInternacion,
} from "../../../shared/types/internacion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServicioInternacionPayload) => Promise<void>;
  initialData?: ServicioInternacion;
}

export default function ServicioForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const { values, handleChange, reset } =
    useForm<CreateServicioInternacionPayload>({
      nombre_servicio: initialData?.nombre_servicio ?? "",
      bloque_piso: initialData?.bloque_piso ?? "",
    });

  async function handleSubmit() {
    if (!values.nombre_servicio) return;
    await onSubmit(values);
    reset();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        initialData
          ? "Editar Servicio de Internación"
          : "Nuevo Servicio de Internación"
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Nombre del Servicio
          </label>
          <input
            value={values.nombre_servicio}
            onChange={handleChange("nombre_servicio")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Bloque / Piso
          </label>
          <input
            value={values.bloque_piso ?? ""}
            onChange={handleChange("bloque_piso")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </Modal>
  );
}
