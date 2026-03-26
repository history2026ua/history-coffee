import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/store";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  purchase: "Закупівля зерна",
  packaging: "Упаковка",
  delivery: "Доставка",
  taxes: "Податки",
  other: "Інше",
};

interface Props {
  expenses: Expense[];
  onAdd: (expense: Omit<Expense, "id" | "date">) => void;
}

export default function ExpensesSection({ expenses, onAdd }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>("purchase");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!description.trim() || isNaN(amt) || amt <= 0) return;
    onAdd({ category, description: description.trim(), amount: amt });
    setDescription("");
    setAmount("");
  };

  const totalByCategory = (cat: ExpenseCategory) =>
    expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Додати витрату</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Опис" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input type="number" placeholder="Сума, ₴" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
            <Button onClick={handleAdd} className="gap-1.5">
              <Plus className="h-4 w-4" /> Додати
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([cat, label]) => (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{totalByCategory(cat).toFixed(0)} ₴</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Історія витрат</CardTitle>
          <span className="text-lg font-bold">Всього: {total.toFixed(0)} ₴</span>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Ще немає витрат</p>
          ) : (
            <div className="space-y-2">
              {expenses
                .slice()
                .reverse()
                .map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground mr-2">
                        {CATEGORY_LABELS[exp.category]}
                      </span>
                      <span className="font-medium">{exp.description}</span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        {exp.quantity} × {exp.pricePerUnit.toFixed(2)} ₴
                      </span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        {format(new Date(exp.date), "dd.MM.yyyy", { locale: uk })}
                      </span>
                    </div>
                    <div className="font-semibold text-destructive">{exp.amount.toFixed(0)} ₴</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
