import { get } from "../lib/request";
import type { CafeTable } from "../types/cafeTable";

export const tablesApi = {
  getAll: () => get<CafeTable[]>("/CafeTables"),
};
