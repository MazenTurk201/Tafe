import { get } from "../lib/request";
import type { ProductSearchResult } from "@/types/product";

export const ProductsApi = {
  GetProducts: () => get<ProductSearchResult[]>("/Products"),
  Search: (name: string) =>
    get<ProductSearchResult[]>("/Products/Search", {
      Name: name,
    }),
};