import type { Category } from "./category";
import type { IngredientProduct } from "./ingredient";

export interface MenuProduct {
  id: number;
  name: string;
  price: number;
  ingredients: IngredientProduct[];
}

export interface MenuCategory {
  id: number;
  name: string;
  products: MenuProduct[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Category;
  ingredients: IngredientProduct[];
}