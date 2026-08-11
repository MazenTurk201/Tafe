import api from "./api";

export const get = <T>(url: string, params?: object): Promise<T> =>
  api.get<T>(url, { params }).then((res) => res.data);

export const post = <T>(url: string, data?: unknown): Promise<T> =>
  api.post<T>(url, data).then((res) => res.data);

export const patch = <T>(url: string, data?: unknown): Promise<T> =>
  api.patch<T>(url, data).then((res) => res.data);

export const del = <T = void>(url: string): Promise<T> =>
  api.delete<T>(url).then((res) => res.data);
