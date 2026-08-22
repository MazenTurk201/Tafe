export interface LoginRequest {
  username: string;
  password: string;
  rememmberMe: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
}

export interface AuthResponse {
  token: string;
  expires: string;
}