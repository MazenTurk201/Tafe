import type { Ingredient, IngredientCreate, IngredientUpdate, IngredientWarning } from "@/types/ingredient";
import { get, post, del, patch } from "../lib/request";

export const IngredientsApi = {
  GetIngredients: () => get<Ingredient[]>("/Ingredients"),
  GetDeletedIngredients: () => get<Ingredient[]>("/Ingredients/Deleted"),
  GetIngredientsWarning: () => get<IngredientWarning>("/Ingredients/Warning"),
  GetIngredientsWarningCount: () => get<number>("/Ingredients/Warning/Count"),
  CreateIngredient: (data: IngredientCreate) => post<void>("/Ingredients", data),
  DeleteIngredient: (id: number) => del<void>("/Ingredients?id=" + id),
  EditIngredient: (data: IngredientUpdate,) => patch<void>("/Ingredients", data),
  RestoreIngredient: (id: number) => patch<void>("/Ingredients/Restore?id=" + id),
};