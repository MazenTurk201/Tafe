import type { Product, ProductCreate, ProductEdit } from "@/types/product";
import { del, get, patch, post, put } from "../lib/request";

export const ProductsApi = {
  GetProducts: () => get<Product[]>("/Products"),
  Search: (name: string) => get<Product[]>("/Products/Search", {Name: name}),
  GetDeletedProducts: () => get<Product[]>("/Products/Deleted"),
  CreateProduct: (data: ProductCreate) => post<void>("/Products", data),
  DeleteProduct: (id: number) => del<void>("/Products?id=" + id),
  EditProduct: (data: ProductEdit) => patch<void>("/Products", data),
  RestoreProduct: (id: number) => patch<void>("/Products/Restore?id=" + id),
  AddIngredient: (ProductId: number,IngredientId: number, Quantity: number) => put<void>(`/Products/AddIngredient?ProductId=${ProductId}&IngredientId=${IngredientId}&Quantity=${Quantity}`),
  RemoveIngredient: (ProductId: number, IngredientId: number) => del<void>(`/Products/RemoveIngredient?ProductId=${ProductId}&IngredientId=${IngredientId}`),
};
