import api from "../../../../shared/services/api";
import type { UserPaginated, User, CreateUserPayload, UpdateRolePayload } from "../../../../shared/types/user";

export async function getUsers(offset = 0, limit = 20): Promise<UserPaginated> {
  const res = await api.get<UserPaginated>("/admin/user", { params: { offset, limit } });
  return res.data;
}

export async function searchUsers(query: string, offset = 0, limit = 20): Promise<UserPaginated> {
  const res = await api.get<UserPaginated>("/admin/user", { params: { query, offset, limit } });
  return res.data;
}

export async function createUser(data: CreateUserPayload): Promise<User> {
  const res = await api.post<User>("/admin/user", data);
  return res.data;
}

export async function updateRole(userId: number, data: UpdateRolePayload): Promise<User> {
  const res = await api.patch<User>(`/admin/user/${userId}/role`, data);
  return res.data;
}

export async function deactivateUser(userId: number): Promise<void> {
  await api.delete(`/admin/user/${userId}`);
}

export async function reactivateUser(userId: number): Promise<User> {
  const res = await api.patch<User>(`/admin/user/${userId}/reactivate`);
  return res.data;
}
