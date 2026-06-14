import { useState, type FormEvent, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Completá todos los campos");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Sesión iniciada");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && "response" in err) {
        const axiosErr = err as { response?: { status: number } };
        if (axiosErr.response?.status === 401) {
          toast.error("Email o contraseña incorrectos");
        } else {
          toast.error("Error del servidor. Intentá de nuevo.");
        }
      } else {
        toast.error("Error de conexión");
      }
    } finally {
      setSubmitting(false);
    }
  }

  type DemoUser = "admin" | "operator";

  const demoCredentials: Record<DemoUser, { email: string; password: string }> =
    {
      admin: {
        email: import.meta.env.VITE_ADMIN_USER_DEMO,
        password: import.meta.env.VITE_ADMIN_USER_PASS,
      },
      operator: {
        email: import.meta.env.VITE_OPERATOR_USER_DEMO,
        password: import.meta.env.VITE_OPERATOR_USER_PASS,
      },
    };

  const handleDemo = (e: SyntheticEvent, user: DemoUser) => {
    e.preventDefault();
    setEmail(demoCredentials[user].email);
    setPassword(demoCredentials[user].password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl bg-card px-6 py-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
              <LogIn className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SGV</h1>
            <p className="mt-1 text-sm text-muted">
              Sistema de Gestión de Visitantes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="user@mail.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg cursor-pointer bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primary-hover disabled:opacity-60"
            >
              <LogIn size={18} />
              {submitting ? "Ingresando…" : "Ingresar"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-semibold uppercase tracking-tighter text-green-800 bg-green-100 border-2 border-green-800 rounded-lg cursor-pointer hover:bg-green-300"
                onClick={(e) => handleDemo(e, "operator")}
              >
                Demo Operador
              </button>
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-semibold uppercase tracking-tighter text-violet-800 bg-violet-100 border-2 border-violet-800 rounded-lg cursor-pointer hover:bg-violet-300"
                onClick={(e) => handleDemo(e, "admin")}
              >
                Demo Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
