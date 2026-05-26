import { apiBaseURL } from "./auth-client";
import type { Category, Expense } from "@hea/shared";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBaseURL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listExpenses: () => request<{ expenses: Expense[] }>("/api/expenses"),
  createExpense: (data: {
    amountCents: number;
    currency?: string;
    categoryId?: string | null;
    note?: string;
    occurredAt: number;
    receiptKey?: string;
  }) =>
    request<{ id: string }>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteExpense: (id: string) =>
    request<{ ok: true }>(`/api/expenses/${id}`, { method: "DELETE" }),
  listCategories: () => request<{ categories: Category[] }>("/api/categories"),
  createCategory: (data: { name: string; icon?: string; color?: string }) =>
    request<{ id: string }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
