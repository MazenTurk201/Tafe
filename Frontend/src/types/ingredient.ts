import type { Unit } from "./unit";

export interface Ingredient {
  id: number;
  name: string;
  minQuantityAlert: number;
  unit: Unit;
  quantity: number;
}

export interface IngredientCreate {
  name: string;
  minQuantityAlert: number;
  unitId: number;
}

export interface IngredientUpdate {
  id: number;
  name: string;
  minQuantityAlert: number;
  unitId: number;
}

export interface IngredientWarning {
  id: number;
  name: string;
  quantity: number;
  minQuantityAlert: number;
  unit: string;
}