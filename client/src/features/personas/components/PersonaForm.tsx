import Button from "../../../shared/components/Button";
import Modal from "../../../shared/components/Modal";
import { useForm } from "../../../shared/hooks/useForm";
import type {
  CreatePersonaPayload,
  Persona,
} from "../../../shared/types/persona";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonaPayload) => Promise<void>;
  initialData?: Persona;
}

export default function PersonaForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: Props) {
  const { values, handleChange, reset } = useForm<CreatePersonaPayload>({
    dni: initialData?.dni ?? "",
    nombre: initialData?.nombre ?? "",
    apellido: initialData?.apellido ?? "",
    fecha_nacimiento: initialData?.fecha_nacimiento ?? "",
    telefono: initialData?.telefono ?? "",
  });

  async function handleSubmit() {
    if (!values.dni || !values.nombre || !values.apellido) return;
    await onSubmit(values);
    reset();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Persona" : "Nueva Persona"}
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              DNI
            </label>
            <input
              name="dni"
              value={values.dni}
              onChange={handleChange("dni")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Teléfono
            </label>
            <input
              name="telefono"
              value={values.telefono ?? ""}
              onChange={handleChange("telefono")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Nombre
            </label>
            <input
              name="nombre"
              value={values.nombre}
              onChange={handleChange("nombre")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Apellido
            </label>
            <input
              name="apellido"
              value={values.apellido}
              onChange={handleChange("apellido")}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={values.fecha_nacimiento ?? ""}
            onChange={handleChange("fecha_nacimiento")}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </Modal>
  );
}
