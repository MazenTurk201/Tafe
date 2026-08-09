export type OrderType =
  | "DineIn"
  | "TakeAway"
  | "Delivery";

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName?: string;

  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: number;
  orderNumber: string;

  customerId?: string | null;
  customerName?: string | null;

  cashierId?: string | null;
  cashierName?: string | null;

  tableId?: number | null;
  tableName?: string | null;

  orderType: OrderType;
  status: OrderStatus;

  subTotal: number;
  discount: number;
  tax: number;
  service: number;
  total: number;

  createdAt: string;
  updatedAt: string;

  items: OrderItem[];
}

export interface OrderItemCreate {
  productId: number;
  quantity: number;
  discount: number;
  notes?: string;
}

export interface OrderCreate {
  customerId?: string | null;
  tableId?: number | null;
  orderType: OrderType;

  discount: number;
  tax: number;
  service: number;

  items: OrderItemCreate[];
}

export interface OrderUpdate {
  id: number;

  customerId?: string | null;
  orderType?: OrderType;
  tableId?: number;

  discount?: number;
  tax?: number;
  service?: number;
}

export interface OrderStatusUpdate {
  id: number;
  status: OrderStatus;
}

export interface OrderItemUpdate {
  id: number;
  productId: number;
  quantity: number;
  discount: number;
  notes?: string;
}