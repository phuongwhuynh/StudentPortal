export type UserRole = "guest" | "student" | "staff";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AuthSession {
  user: User | null;
  isGuest: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterStaffPayload {
  email: string;
  password: string;
  displayName: string;
}
