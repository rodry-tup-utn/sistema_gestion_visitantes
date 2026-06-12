export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface UserAdmin extends User {
  created_at: string;
  updated_at: string | null;
}

export interface UserPaginated {
  data: UserAdmin[];
  total: number;
}

export interface CreateUserPayload {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: "ADMIN" | "OPERATOR";
}

export interface UpdateRolePayload {
  role: "ADMIN" | "OPERATOR";
}

export interface UpdateProfilePayload {
  name?: string;
  lastname?: string;
  email?: string;
}

export interface UpdatePasswordPayload {
  old_pass: string;
  new_pass: string;
}
