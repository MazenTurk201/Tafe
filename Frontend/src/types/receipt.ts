export interface ReceiptData {
  invoiceNumber: string;
  issuedAt: string;
  cashierName: string;
  customerName: string;
  orderType: string;
  tableNumber?: string;
  paymentMethod: string;
  discount: number;
  taxRate: number;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
}