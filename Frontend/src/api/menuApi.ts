import type { MenuCategory } from "@/types/menu";
import { get } from "../lib/request";

export const MenuApi = {
  GetMenu: () => get<MenuCategory[]>("/Menu"),
};