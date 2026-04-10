import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  onUpdate: (id: string, data: Partial<Omit<Expense, "id" | "date">>) => void;
  onDelete: (id: string) => void;
}

export default function ExpensesSection({ expenses, onAdd, onUpdate, onDelete }: Props) {
  const [category, setCategory] = useState<ExpenseCategory>("purchase");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | null>(null);
  const [editCategory, setEditCategory] = useState<ExpenseCategory>("purchase");
  const [editDescription, setEditDescription] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPricePerUnit, setEditPricePerUnit] = useState("");

  const parsedQty = parseFloat(quantity);
  const parsedPrice = parseFloat(pricePerUnit);
  const calculatedAmount = !isNaN(parsedQty) && !isNaN(parsedPrice) ? parsedQty * parsedPrice : 0;

  const editParsedQty = parseFloat(editQuantity);
  const editParsedPrice = parseFloat(editPricePerUnit);
  const editCalculatedAmount = !isNaN(editParsedQty) && !isNaN(editParsedPrice) ? editParsedQty * editParsedPrice : 0;

  const handleAdd = () => {
    if (!description.trim() || isNaN(parsedQty) || parsedQty <= 0 || isNaN(parsedPrice) || parsedPrice <= 0) return;
    onAdd({ category, description: description.trim(), quantity: parsedQty, pricePerUnit: parsedPrice, amount: calculatedAmount });
    setDescription("");
    setQuantity("");
    setPricePerUnit("");
  };

  const openEdit = (item: Expense) => {
    setEditItem(item);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditQuantity(String(item.quantity));
    setEditPricePerUnit(String(item.pricePerUnit));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editItem || !editDescription.trim() || isNaN(editParsedQty) || editParsedQty <= 0 || isNaN(editParsedPrice) || editParsedPrice <= 0) return;
    onUpdate(editItem.id, {
      category: editCategory,
      description: editDescription.trim(),
      quantity: editParsedQty,
      pricePerUnit: editParsedPrice,
      amount: editCalculatedAmount,
    });
    setEditOpen(false);
    setEditItem(null);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
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
            <Input type="number" placeholder="Кількість" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="0" step="0.01" />
            <Input type="number" placeholder="Ціна за од., ₴" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} min="0" step="0.01" />
            <div className="text-sm font-semibold text-muted-foreground self-center">
              Сума: {calculatedAmount > 0 ? `${calculatedAmount.toFixed(2)} ₴` : "—"}
            </div>
            <Button onClick={handleAdd} className="gap-1.5">
              <Plus className="h-4 w-4" /> Додати
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редагувати витрату</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Категорія</Label>
              <Select value={editCategory} onValueChange={(v) => setEditCategory(v as ExpenseCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Опис</Label><Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div>
            <div><Label>Кількість</Label><Input type="number" step="0.01" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} /></div>
            <div><Label>Ціна за од. (₴)</Label><Input type="number" step="0.01" value={editPricePerUnit} onChange={(e) => setEditPricePerUnit(e.target.value)} /></div>
            <div className="text-sm font-semibold">
              Сума: {editCalculatedAmount > 0 ? `${editCalculatedAmount.toFixed(2)} ₴` : "—"}
            </div>
            <Button onClick={handleEdit} className="w-full">Зберегти</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-destructive">{exp.amount.toFixed(0)} ₴</span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(exp)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(exp.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
