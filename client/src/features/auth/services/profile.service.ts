import api from "../../../shared/services/api";
import type { User, UpdateProfilePayload } from "../../../shared/types/user";

export async function getProfile(): Promise<User> {
  const res = await api.get<User>("/profile/me");
  return res.data;
}

export async function updateProfile(data: UpdateProfilePayload): Promise<void> {
  await api.patch("/profile/update", data);
}

export async function changePassword(data: {
  old_pass: string;
  new_pass: string;
}): Promise<void> {
  await api.patch("/profile/password", data);
}
