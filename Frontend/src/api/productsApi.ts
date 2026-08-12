import { get } from "../lib/request";
import type { ProductSearchResult } from "@/types/product";

export const ProductsApi = {
  Search: (name: string) =>
    get<ProductSearchResult[]>("/Products/Search", {
      Name: name,
    }),
};