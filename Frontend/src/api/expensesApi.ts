import type { Expense, ExpenseCreate } from "@/types/expense";
import { get, post, del, patch } from "../lib/request";

export const ExpensesApi = {
  GetExpenses: () => get<Expense[]>("/Expenses"),
  GetExpensesbyDate: (From: string, To: string) => get<Expense[]>(`/Expenses/${From}/${To}`),
  GetTotalExpenses: () => get<number>("/Expenses/Total"),
  GetTotalExpensesbyDate: (From: string, To: string) => get<number>(`/Expenses/Total/${From}/${To}`),
  GetDeletedExpenses: () => get<Expense[]>("/Expenses/Deleted"),
  CreateExpense: (data: ExpenseCreate) => post<void>("/Expenses", data),
  DeleteExpense: (id: number) => del<void>("/Expenses?id=" + id),
  EditExpense: (data: Expense) => patch<void>("/Expenses", data),
  RestoreExpense: (id: number) => patch<void>("/Expenses/Restore?id=" + id),
};