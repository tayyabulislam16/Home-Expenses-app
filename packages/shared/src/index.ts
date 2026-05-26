export type Category = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type Expense = {
  id: string;
  amountCents: number;
  currency: string;
  note: string | null;
  occurredAt: number;
  receiptKey: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export function formatAmount(amountCents: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amountCents / 100);
}
