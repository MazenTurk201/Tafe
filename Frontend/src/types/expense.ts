export type ExpenseType =
  | "Rent"
  | "Electricity"
  | "Water"
  | "Gas"
  | "Internet"
  | "Salary"
  | "Maintenance"
  | "Purchases"
  | "Other";

export interface Expense {
  id: number;
  name: string;
  amount: number;
  expenseDate: string;
  type: ExpenseType,
  notes?: string;
}

export interface ExpenseCreate {
  name: string;
  amount: number;
  expenseDate: string;
  type: ExpenseType,
  notes?: string;
}