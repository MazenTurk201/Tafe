import type { Category } from "@/types/category";
import { get, post, del, patch } from "../lib/request";

export const CategoriesApi = {
  GetCategories: () => get<Category[]>("/Categories"),
  GetDeletedCategories: () => get<Category[]>("/Categories/Deleted"),
  CreateCategory: (name: string) => post<void>("/Categories?Name=" + name),
  DeleteCategory: (id: number) => del<void>("/Categories?id=" + id),
  EditCategory: (id: number, name: string) => patch<void>("/Categories?id=" + id + "&Name=" + name),
  RestoreCategory: (id: number) => patch<void>("/Categories/Restore?id=" + id),
};