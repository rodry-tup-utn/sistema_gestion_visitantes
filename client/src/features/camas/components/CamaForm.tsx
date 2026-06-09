import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import { useForm } from "../../../shared/hooks/useForm";
import type {
  Cama,
  CreateCamaPayload,
} from "../../../shared/types/internacion";
import { useServicios } from "../../servicios-internacion/hooks/useServiciosInternacion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCamaPayload) => Promise<void>;
  initialData?: Cama;
}

export default function CamaForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const { data: serviciosData } = useServicios();
  const { values, handleChange, setValues, reset } = useForm<CreateCamaPayload>(
    {
      servicio_internacion_id: initialData?.servicio_internacion_id ?? 1,
      sala: initialData?.sala ?? "",
      cama: initialData?.cama ?? "",
      estado_disponibilidad: initialData?.estado_disponibilidad ?? "Disponible",
    },
  );

  async function handleSubmit() {
    if (!values.sala || !values.cama) return;
    await onSubmit(values);
    reset();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Cama" : "Nueva Cama"}
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
            Servicio
          </label>
          <select
            value={values.servicio_internacion_id}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                servicio_internacion_id: Number(e.target.value),
              }))
            }
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {(serviciosData?.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre_servicio}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Sala
            </label>
            <input
              value={values.sala}
              onChange={handleChange("sala")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Cama
            </label>
            <input
              value={values.cama}
              onChange={handleChange("cama")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Estado
          </label>
          <select
            value={values.estado_disponibilidad}
            onChange={handleChange("estado_disponibilidad")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="Disponible">Disponible</option>
            <option value="Ocupada">Ocupada</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="No Disponible">No Disponible</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
