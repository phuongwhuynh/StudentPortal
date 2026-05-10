import type { LoginPayload, RegisterStaffPayload, User } from "../../types/auth";
import { API_ENDPOINTS } from "../constants";
import { requestJson } from "../http";

type BackendUser = {
  id: number;
  email: string;
  role: string;
  full_name: string;
};

const normalizeUser = (user: BackendUser): User => ({
  id: String(user.id),
  email: user.email,
  displayName: user.full_name,
  role: user.role as User["role"],
});

export async function login(payload: LoginPayload): Promise<User> {
  const response = await requestJson<BackendUser>([API_ENDPOINTS.authSignin], {
    method: "POST",
    body: payload,
  });
  return normalizeUser(response);
}

export async function logout(): Promise<true> {
  await requestJson<unknown>([API_ENDPOINTS.authSignout], {
    method: "POST",
  });
  return true;
}

export async function registerStaff(_payload: RegisterStaffPayload): Promise<User> {
  throw new Error("Register staff endpoint is not available in backend API");
}
