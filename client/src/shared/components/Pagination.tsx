interface Props {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export default function Pagination({ page, total, limit, onPageChange, label = "elementos" }: Props) {
  if (total <= limit) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted">
      <button
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="rounded-lg border border-gray-300 bg-card px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
      >
        Anterior
      </button>
      <span>Página {page + 1} · {total} {label}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={(page + 1) * limit >= total}
        className="rounded-lg border border-gray-300 bg-card px-3 py-1.5 transition hover:bg-gray-50 disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}
