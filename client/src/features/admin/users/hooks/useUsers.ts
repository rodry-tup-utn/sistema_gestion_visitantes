import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersService from "../services/users.service";
import type { CreateUserPayload, UpdateRolePayload } from "../../../../shared/types/user";

const USERS_KEY = ["users"];

export function useUsers(offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...USERS_KEY, { offset, limit }],
    queryFn: () => usersService.getUsers(offset, limit),
  });
}

export function useSearchUsers(query: string, offset = 0, limit = 20) {
  return useQuery({
    queryKey: [...USERS_KEY, "search", { query, offset, limit }],
    queryFn: () => usersService.searchUsers(query, offset, limit),
    enabled: query.length >= 2,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersService.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateRolePayload }) =>
      usersService.updateRole(userId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => usersService.deactivateUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useReactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => usersService.reactivateUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
