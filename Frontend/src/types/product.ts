import type { Category } from "./category";
import type { IngredientProduct } from "./ingredient";

export interface Product{
  id: number;
  name: string;
  price: number;
  category: Category;
  ingredients: IngredientProduct[];
}

export interface ProductCreate{
  name: string;
  price: number;
  CategoryId: number | "";
}

export interface ProductIngredient {
  id: number;
  name: string;
  unit: string;
  quantity: number;
}

export interface ProductEdit {
  id: number;
  name: string;
  price: number;
  CategoryId: number;
  Ingredients?: ProductIngredient[];
}