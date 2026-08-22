import { get, post, patch, del } from "../lib/request";

export interface EmployeeProfile {
  userId: string;
  userName: string;
  fullName: string;
  email: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
}

export interface EmployeeCreateDTO {
  user: {
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    address?: string;
  };
  salary: number;
  hireDate: string;
  roleName: string;
}

export interface EmployeeUpdateDTO {
  userId: string;
  salary: number;
  hireDate: string;
  isActive: boolean;
}

export interface Role {
  id: string;
  name: string;
}

export const EmployeesApi = {
  GetEmployees: () => get<EmployeeProfile[]>("/EmployeeProfile"),
  GetEmployee: (userId: string) => get<EmployeeProfile>(`/EmployeeProfile/${userId}`),
  SearchEmployees: (searchTerm: string) => get<EmployeeProfile[]>(`/EmployeeProfile/Search/${searchTerm}`),
  CreateEmployee: (data: EmployeeCreateDTO) => post<void>("/EmployeeProfile", data),
  UpdateEmployee: (data: EmployeeUpdateDTO) => patch<void>("/EmployeeProfile", data),
  GetDeletedEmployees: () => get<EmployeeProfile[]>("/EmployeeProfile/Deleted"),
  DeleteEmployee: (userName: string) => del<void>(`/EmployeeProfile/${userName}`),
  RestoreEmployee: (userName: string) => patch<void>(`/EmployeeProfile/Restore/${userName}`),
  GetRoles: () => get<Role[]>("/Role"),
};