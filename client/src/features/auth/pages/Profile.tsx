import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Pencil,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../services/profile.service";
import type { User as UserType } from "../../../shared/types/user";
import PageHeader from "../../../shared/components/PageHeader";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Spinner from "../../../shared/components/Spinner";

export default function Profile() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setLastname(p.lastname);
        setEmail(p.email);
      })
      .catch(() => toast.error("Error al cargar perfil"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    if (!name || !lastname || !email) {
      toast.error("Completá todos los campos");
      return;
    }
    try {
      await updateProfile({ name, lastname, email });
      setProfile((prev) => (prev ? { ...prev, name, lastname, email } : null));
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Perfil actualizado");
    } catch {
      toast.error("Error al actualizar perfil");
    }
  }

  function handleCancelEdit() {
    if (profile) {
      setName(profile.name);
      setLastname(profile.lastname);
      setEmail(profile.email);
    }
    setEditing(false);
  }

  async function handleChangePassword() {
    if (!oldPass || !newPass || !confirmPass) {
      toast.error("Completá todos los campos");
      return;
    }
    if (newPass.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    if (newPass == oldPass) {
      toast.error("La nueva contraseña debe ser diferente a la anterior");
    }
    setChangingPass(true);
    try {
      await changePassword({ old_pass: oldPass, new_pass: newPass });
      toast.success("Contraseña actualizada");
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch {
      toast.error(
        "Error al cambiar la contraseña. Verificá la contraseña actual.",
      );
    } finally {
      setChangingPass(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <>
      <PageHeader title="Mi Perfil" />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <User size={30} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold text-gray-900">
                  {profile?.name} {profile?.lastname}
                </p>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Shield size={14} />
                    {profile?.role === "ADMIN" ? "Administrador" : "Operador"}
                  </span>
                </div>
              </div>
              {!editing && (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <Pencil size={16} />
                  Editar
                </Button>
              )}
            </div>
            <div className="mt-5 space-y-3 border-t pt-5">
              <div className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-gray-400" />
                {editing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                ) : (
                  <span className="text-sm text-gray-600">
                    {profile?.email}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500">
                    Nombre
                  </label>
                  {editing ? (
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">
                    Apellido
                  </label>
                  {editing ? (
                    <input
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">
                      {profile?.lastname}
                    </p>
                  )}
                </div>
              </div>
              {editing && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={handleCancelEdit}>
                    <X size={16} />
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    <Save size={16} />
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <KeyRound size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Cambiar Contraseña
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input
                  type={showOld ? "text" : "password"}
                  placeholder="Contraseña actual"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmar nueva"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} loading={changingPass}>
                  <KeyRound size={16} />
                  Cambiar contraseña
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
