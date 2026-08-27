export interface LoginRequest {
  username: string;
  password: string;
  rememmberMe: boolean;
}

export interface RegisterRequest {
  user: {
    firstName: string,
    lastName: string,
    userName: string,
    email: string,
    password: string,
    confirmPassword: string,
    address?: string;
  };
  birthDate: string;
}

export interface AuthResponse {
  token: string;
  expires: string;
}