import { post } from "../lib/request";
import type { ReceiptData } from "@/types/receipt";

export const ReceiptApi = {
  GetReceipt: (data: ReceiptData) =>
    post<Blob>("/Invoices/receipt", data, {
      responseType: "blob",
    }),
};