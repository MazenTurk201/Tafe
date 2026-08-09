import axios from "axios";
import type {
  Order,
  OrderCreate,
  OrderUpdate,
  OrderStatusUpdate,
  OrderItemCreate,
  OrderItemUpdate,
} from "../types/order";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5069";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/Orders");
    return res.data;
  },

  getById: async (id: number): Promise<Order> => {
    const res = await api.get<Order>(`/Orders/${id}`);
    return res.data;
  },

  getActive: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/Orders/Active");
    return res.data;
  },

  getToday: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/Orders/Today");
    return res.data;
  },

  getDeleted: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/Orders/Deleted");
    return res.data;
  },

  create: async (data: OrderCreate): Promise<Order> => {
    const res = await api.post<Order>("/Orders", data);
    return res.data;
  },

  addItem: async (
    orderId: number,
    data: OrderItemCreate
  ): Promise<Order> => {
    const res = await api.post<Order>(
      `/Orders/AddItem?orderId=${orderId}`,
      data
    );

    return res.data;
  },

  update: async (data: OrderUpdate): Promise<Order> => {
    const res = await api.patch<Order>("/Orders", data);
    return res.data;
  },

  updateStatus: async (
    data: OrderStatusUpdate
  ): Promise<Order> => {
    const res = await api.patch<Order>(
      "/Orders/Status",
      data
    );

    return res.data;
  },

  updateItem: async (
    data: OrderItemUpdate
  ): Promise<Order> => {
    const res = await api.patch<Order>(
      "/Orders/Item",
      data
    );

    return res.data;
  },

  deleteItem: async (id: number): Promise<Order> => {
    const res = await api.delete<Order>(
      `/Orders/Item/${id}`
    );

    return res.data;
  },

  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/Orders/${id}`);
  },

  restore: async (id: number): Promise<void> => {
    await api.patch(`/Orders/Restore?id=${id}`);
  },
};