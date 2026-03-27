import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import type { Client, Sale, GreenCoffee, RoastedCoffee } from "@/lib/store";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface Props {
  clients: Client[];
  sales: Sale[];
  greenCoffee: GreenCoffee[];
  roastedCoffee: RoastedCoffee[];
  onAdd: (sale: Omit<Sale, "id" | "date">) => void;
  onUpdate: (id: string, data: Partial<Omit<Sale, "id" | "date">>) => void;
}

export default function SalesSection({ clients, sales, greenCoffee, roastedCoffee, onAdd, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [coffeeType, setCoffeeType] = useState<"green" | "roasted">("roasted");
  const [coffeeId, setCoffeeId] = useState("");
  const [weight, setWeight] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Sale | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editTotal, setEditTotal] = useState("");

  const coffeeOptions = coffeeType === "green" ? greenCoffee : roastedCoffee;
  const selectedCoffee = coffeeOptions.find((c) => c.id === coffeeId);
  const totalPrice = selectedCoffee && weight ? parseFloat(weight) * selectedCoffee.pricePerKg : 0;

  const handleAdd = () => {
    if (!clientId || !coffeeId || !weight) return;
    onAdd({ clientId, coffeeId, coffeeType, weightKg: parseFloat(weight), totalPrice });
    setClientId(""); setCoffeeId(""); setWeight("");
    setOpen(false);
  };

  const openEdit = (sale: Sale) => {
    setEditItem(sale);
    setEditWeight(String(sale.weightKg));
    setEditTotal(String(sale.totalPrice));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editItem || !editWeight || !editTotal) return;
    onUpdate(editItem.id, { weightKg: parseFloat(editWeight), totalPrice: parseFloat(editTotal) });
    setEditOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Продажі</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={clients.length === 0}><Plus className="h-4 w-4 mr-1" /> Нова продаж</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Нова продаж</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Клієнт</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-background" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">—</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Тип кави</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-background" value={coffeeType} onChange={(e) => { setCoffeeType(e.target.value as any); setCoffeeId(""); }}>
                  <option value="roasted">Смажена</option>
                  <option value="green">Зелена</option>
                </select>
              </div>
              <div>
                <Label>Кава</Label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-background" value={coffeeId} onChange={(e) => setCoffeeId(e.target.value)}>
                  <option value="">—</option>
                  {coffeeOptions.filter((c) => c.weightKg > 0).map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.weightKg.toFixed(1)} кг, {c.pricePerKg} ₴/кг)</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Вага (кг)</Label>
                <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} max={selectedCoffee?.weightKg} />
              </div>
              {totalPrice > 0 && (
                <p className="text-lg font-bold text-center">Сума: {totalPrice.toFixed(0)} ₴</p>
              )}
              <Button onClick={handleAdd} className="w-full">Оформити</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редагувати продаж</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Вага (кг)</Label><Input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} /></div>
            <div><Label>Сума (₴)</Label><Input type="number" step="1" value={editTotal} onChange={(e) => setEditTotal(e.target.value)} /></div>
            <Button onClick={handleEdit} className="w-full">Зберегти</Button>
          </div>
        </DialogContent>
      </Dialog>

      {sales.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Ще немає продажів.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {[...sales].reverse().map((sale) => {
            const client = clients.find((c) => c.id === sale.clientId);
            const coffee = sale.coffeeType === "green"
              ? greenCoffee.find((c) => c.id === sale.coffeeId)
              : roastedCoffee.find((c) => c.id === sale.coffeeId);
            return (
              <Card key={sale.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold">{client?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {coffee?.name ?? "—"} · {sale.weightKg} кг · {format(new Date(sale.date), "dd.MM.yyyy", { locale: uk })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg">{sale.totalPrice.toFixed(0)} ₴</p>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(sale)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
