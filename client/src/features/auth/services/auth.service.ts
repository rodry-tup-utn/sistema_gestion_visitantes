import api from "../../../shared/services/api";
import type { User } from "../../../shared/types/user";

export async function login(email: string, password: string): Promise<void> {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  await api.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getSession(): Promise<User | null> {
  try {
    const res = await api.get<User>("/profile/session");
    return res.data;
  } catch {
    return null;
  }
}
