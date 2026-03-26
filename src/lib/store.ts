import { useState, useEffect, useCallback } from "react";

export interface GreenCoffee {
  id: string;
  name: string;
  origin: string;
  weightKg: number;
  pricePerKg: number;
  addedAt: string;
}

export interface RoastedCoffee {
  id: string;
  sourceGreenId: string;
  name: string;
  weightKg: number;
  pricePerKg: number;
  roastedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  coffeeId: string;
  coffeeType: "green" | "roasted";
  weightKg: number;
  totalPrice: number;
  date: string;
}

export type ExpenseCategory = "purchase" | "packaging" | "delivery" | "taxes" | "other";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

export interface AppState {
  greenCoffee: GreenCoffee[];
  roastedCoffee: RoastedCoffee[];
  clients: Client[];
  sales: Sale[];
  expenses: Expense[];
}

const STORAGE_KEY = "kavoblik-data";

const defaultState: AppState = {
  greenCoffee: [],
  roastedCoffee: [],
  clients: [],
  sales: [],
  expenses: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return defaultState;
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addGreenCoffee = useCallback((coffee: Omit<GreenCoffee, "id" | "addedAt">) => {
    setState((s) => ({
      ...s,
      greenCoffee: [...s.greenCoffee, { ...coffee, id: crypto.randomUUID(), addedAt: new Date().toISOString() }],
    }));
  }, []);

  const roastCoffee = useCallback((greenId: string, weightKg: number, pricePerKg: number) => {
    setState((s) => {
      const green = s.greenCoffee.find((g) => g.id === greenId);
      if (!green || green.weightKg < weightKg) return s;
      const roastedWeight = weightKg * 0.8;
      return {
        ...s,
        greenCoffee: s.greenCoffee.map((g) => (g.id === greenId ? { ...g, weightKg: g.weightKg - weightKg } : g)),
        roastedCoffee: [
          ...s.roastedCoffee,
          {
            id: crypto.randomUUID(),
            sourceGreenId: greenId,
            name: green.name + " (обсмажена)",
            weightKg: roastedWeight,
            pricePerKg,
            roastedAt: new Date().toISOString(),
          },
        ],
      };
    });
  }, []);

  const addClient = useCallback((client: Omit<Client, "id" | "createdAt">) => {
    setState((s) => ({
      ...s,
      clients: [...s.clients, { ...client, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
    }));
  }, []);

  const addSale = useCallback((sale: Omit<Sale, "id" | "date">) => {
    setState((s) => {
      const stock = sale.coffeeType === "green" ? s.greenCoffee : s.roastedCoffee;
      const item = stock.find((c) => c.id === sale.coffeeId);
      if (!item || item.weightKg < sale.weightKg) return s;

      const updateStock = (arr: any[]) =>
        arr.map((c: any) => (c.id === sale.coffeeId ? { ...c, weightKg: c.weightKg - sale.weightKg } : c));

      return {
        ...s,
        greenCoffee: sale.coffeeType === "green" ? updateStock(s.greenCoffee) : s.greenCoffee,
        roastedCoffee: sale.coffeeType === "roasted" ? updateStock(s.roastedCoffee) : s.roastedCoffee,
        sales: [...s.sales, { ...sale, id: crypto.randomUUID(), date: new Date().toISOString() }],
      };
    });
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, "id" | "date">) => {
    setState((s) => ({
      ...s,
      expenses: [...s.expenses, { ...expense, id: crypto.randomUUID(), date: new Date().toISOString() }],
    }));
  }, []);

  return { ...state, addGreenCoffee, roastCoffee, addClient, addSale, addExpense };
}
