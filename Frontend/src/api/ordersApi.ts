import { del, get, patch, post } from "../lib/request";
import type {
  Order,
  OrderCreate,
  OrderItemCreate,
  OrderItemUpdate,
  OrderStatusUpdate,
  OrderUpdate,
  PaymentCreate,
} from "../types/order";

export const ordersApi = {
  getAll: () => get<Order[]>("/Orders"),
  getById: (id: number) => get<Order>(`/Orders/${id}`),
  getActive: () => get<Order[]>("/Orders/Active"),
  getToday: () => get<Order[]>("/Orders/Today"),
  getDeleted: () => get<Order[]>("/Orders/Deleted"),

  create: (data: OrderCreate) =>
    post<Order>("/Orders", data),

  addItem: (orderId: number, data: OrderItemCreate) =>
    post<Order>(`/Orders/AddItem?orderId=${orderId}`, data),

  addPayment: (data: PaymentCreate) =>
    post<void>("/Orders/AddPayment", data),

  update: (data: OrderUpdate) =>
    patch<Order>("/Orders", data),

  updateStatus: (data: OrderStatusUpdate) =>
    patch<Order>("/Orders/Status", data),

  updateItem: (data: OrderItemUpdate) =>
    patch<Order>("/Orders/Item", data),

  deleteItem: (id: number) =>
    del<Order>(`/Orders/Item/${id}`),

  deleteOrder: (id: number) =>
    del<void>(`/Orders/${id}`),

  restore: (id: number) =>
    patch<void>(`/Orders/Restore?id=${id}`),
};
