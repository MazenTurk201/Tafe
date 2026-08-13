import { get } from "../lib/request";
import type { CustomerProfile } from "../types/customer";

export const customersApi = {
  getAll: () =>
    get<CustomerProfile[]>("/CustomerProfile"),

  search: (term: string) =>
    get<CustomerProfile[]>(
      `/CustomerProfile/Search/${term}`
    ),
};
