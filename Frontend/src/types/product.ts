export interface ProductIngredient {
  id: number;
  name: string;
  unit: string;
  quantity: number;
}

export interface ProductSearchResult {
  id: number;
  name: string;
  price: number;
  categiry: string;
  ingredients: ProductIngredient[];
}