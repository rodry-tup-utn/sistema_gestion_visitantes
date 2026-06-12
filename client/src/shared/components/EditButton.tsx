import { Pencil } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function EditButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title="Editar"
      className="flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-100 hover:text-teal-800 active:bg-teal-200"
    >
      <Pencil size={18} />
      Editar
    </button>
  );
}
