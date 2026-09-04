import type { PurchaseInvoices, Supplier, SupplierCreate } from "@/types/supplier";
import { get, post, del, patch } from "../lib/request";

export const SuppliersApi = {
  GetSuppliers: () => get<Supplier[]>("/Suppliers"),
  GetDeletedSuppliers: () => get<Supplier[]>("/Suppliers/Deleted"),
  CreateSupplier: (data: SupplierCreate) => post<void>("/Suppliers", data),
  DeleteSupplier: (id: number) => del<void>("/Suppliers?id=" + id),
  EditSupplier: (data: Supplier) => patch<void>("/Suppliers", data),
  RestoreSupplier: (id: number) => patch<void>("/Suppliers/Restore?id=" + id),
  GetPurchaseInvoices: () => get<PurchaseInvoices[]>("/Suppliers/PurchaseInvoices"),
  // GetDeletedPurchaseInvoices: () => get<PurchaseInvoices[]>("/Suppliers/PurchaseInvoices/Deleted"),
  GetPurchaseInvoicesBySupplier: (id: number) => get<PurchaseInvoices[]>("/Suppliers/" + id + "/PurchaseInvoices"),
  DeletePurchaseInvoices: (id: number) => del<void>("/Suppliers/PurchaseInvoices/" + id),
};
