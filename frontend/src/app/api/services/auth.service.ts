import type { LoginPayload, RegisterStaffPayload, User } from "../../types/auth";
import { API_ENDPOINTS } from "../constants";
import { loginMock, logoutMock, registerStaffMock } from "../mockHandlers";

export async function login(payload: LoginPayload): Promise<User> {
  // Real API: POST ${API_ENDPOINTS.authLogin}
  return loginMock(payload);
}

export async function logout(): Promise<true> {
  // Real API: POST ${API_ENDPOINTS.authLogout}
  return logoutMock();
}

export async function registerStaff(payload: RegisterStaffPayload): Promise<User> {
  // Real API: POST ${API_ENDPOINTS.authRegisterStaff}
  return registerStaffMock(payload);
}
