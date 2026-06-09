interface Props {
  variant?: "default" | "primary" | "success" | "danger" | "warning" | "purple";
  children: string;
}

const styles: Record<string, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-primary-light text-primary-dark",
  success: "bg-green-100 text-green-700",
  danger: "bg-red-100 text-red-700",
  warning: "bg-yellow-100 text-yellow-700",
  purple: "bg-purple-100 text-purple-700",
};

export default function Badge({ variant = "default", children }: Props) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${styles[variant]}`}>
      {children}
    </span>
  );
}
