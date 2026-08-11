import { post } from "../lib/request";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    post<AuthResponse>("/Account/Login", data),

  register: (data: RegisterRequest) =>
    post<void>("/Account/Register", data),
};
