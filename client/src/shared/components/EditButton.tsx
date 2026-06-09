import { Pencil } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function EditButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="rounded-md p-1.5 text-muted transition hover:bg-gray-100 hover:text-gray-700"
      title="Editar"
    >
      <Pencil size={16} />
    </button>
  );
}
