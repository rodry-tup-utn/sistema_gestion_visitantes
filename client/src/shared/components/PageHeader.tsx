interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PageHeader({ title, actionLabel, onAction }: Props) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-3">
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
        {title}
      </h1>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary-hover"
        >
          + {actionLabel}
        </button>
      )}
    </div>
  );
}
