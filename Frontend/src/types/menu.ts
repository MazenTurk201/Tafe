export interface MenuProduct {
  id: number;
  name: string;
  price: number;
  ingredients: Array<{
    ingredientId: number;
    name: string;
    quantity: number;
    unit: string;
  }>;
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
  category: {
    id: number;
    name: string;
  };
  ingredients: Array<{
    id: number;
    name: string;
    unit: string;
    quantity: number;
  }>;
}