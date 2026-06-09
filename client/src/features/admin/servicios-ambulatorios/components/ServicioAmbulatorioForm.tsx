import { useForm } from "../../../../shared/hooks/useForm";
import Modal from "../../../../shared/components/Modal";
import Button from "../../../../shared/components/Button";
import type { CreateServicioAmbulatorioPayload, ServicioAmbulatorio } from "../../../../shared/types/internacion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServicioAmbulatorioPayload) => Promise<void>;
  initialData?: ServicioAmbulatorio;
}

export default function ServicioAmbulatorioForm({ isOpen, onClose, onSubmit, initialData }: Props) {
  const { values, handleChange, reset } = useForm<CreateServicioAmbulatorioPayload>({
    nombre_servicio: initialData?.nombre_servicio ?? "",
    ubicacion_interna: initialData?.ubicacion_interna ?? "",
    estado: initialData?.estado ?? "Activo",
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
      title={initialData ? "Editar Servicio Ambulatorio" : "Nuevo Servicio Ambulatorio"}
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={handleSubmit}>Guardar</Button></>}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">Nombre del Servicio</label>
          <input value={values.nombre_servicio} onChange={handleChange("nombre_servicio")} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Ubicación</label>
          <input value={values.ubicacion_interna ?? ""} onChange={handleChange("ubicacion_interna")} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Estado</label>
          <select value={values.estado} onChange={handleChange("estado")} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
