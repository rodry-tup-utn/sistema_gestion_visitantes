import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow disabled:opacity-60",
  secondary: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50",
  danger: "bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50",
};

export default function Button({ variant = "primary", loading, children, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
    >
      {loading ? "Cargando…" : children}
    </button>
  );
}
