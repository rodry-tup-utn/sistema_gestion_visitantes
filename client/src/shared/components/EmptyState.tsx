interface Props {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ label, actionLabel, onAction }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-card p-12 text-center">
      <p className="text-muted">No hay {label} registrados</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
