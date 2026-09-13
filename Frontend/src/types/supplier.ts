export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierCreate {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface PurchaseInvoices {
  id: number,
  invoiceNumber: string,
  supplierId: number,
  supplierName: string,
  total: number,
  createdAt: string,
  items: [
    {
      id: number,
      ingredientId: number,
      ingredientName: string,
      quantity: number,
      unitPrice: number,
      total: number
    }
  ]
}

export interface PurchaseInvoicesBySupplier {
  id: number,
  invoiceNumber: string,
  total: number,
  createdAt: string,
  supplierId: number,
  supplierName: string,
  items: [
    {
      id: number,
      ingredientId: number,
      ingredientName: string,
      quantity: number,
      unitPrice: number,
      total: number
    }
  ]
}

export interface PurchaseInvoicesCreate {
  supplierId: number,
  items: [
    {
      ingredientId: number,
      quantity: number,
      price: number
    }
  ]
}