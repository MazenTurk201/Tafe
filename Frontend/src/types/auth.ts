export interface LoginRequest {
  username: string;
  password: string;
  rememmberMe: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expires: string;
}