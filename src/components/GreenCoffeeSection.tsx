import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Flame, Pencil } from "lucide-react";
import type { GreenCoffee } from "@/lib/store";

interface Props {
  greenCoffee: GreenCoffee[];
  onAdd: (coffee: Omit<GreenCoffee, "id" | "addedAt">) => void;
  onRoast: (greenId: string, weightKg: number, pricePerKg: number) => void;
  onUpdate: (id: string, data: Partial<Omit<GreenCoffee, "id" | "addedAt">>) => void;
}

export default function GreenCoffeeSection({ greenCoffee, onAdd, onRoast, onUpdate }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [roastOpen, setRoastOpen] = useState(false);
  const [roastId, setRoastId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<GreenCoffee | null>(null);

  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const [roastWeight, setRoastWeight] = useState("");
  const [roastPrice, setRoastPrice] = useState("");

  const [editName, setEditName] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const handleAdd = () => {
    if (!name || !weight || !price) return;
    onAdd({ name, origin, weightKg: parseFloat(weight), pricePerKg: parseFloat(price) });
    setName(""); setOrigin(""); setWeight(""); setPrice("");
    setAddOpen(false);
  };

  const handleRoast = () => {
    if (!roastId || !roastWeight || !roastPrice) return;
    onRoast(roastId, parseFloat(roastWeight), parseFloat(roastPrice));
    setRoastWeight(""); setRoastPrice(""); setRoastId("");
    setRoastOpen(false);
  };

  const openEdit = (item: GreenCoffee) => {
    setEditItem(item);
    setEditName(item.name);
    setEditOrigin(item.origin);
    setEditWeight(String(item.weightKg));
    setEditPrice(String(item.pricePerKg));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editItem || !editName || !editWeight || !editPrice) return;
    onUpdate(editItem.id, { name: editName, origin: editOrigin, weightKg: parseFloat(editWeight), pricePerKg: parseFloat(editPrice) });
    setEditOpen(false);
    setEditItem(null);
  };

  const selectedGreen = greenCoffee.find((g) => g.id === roastId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Зелена кава на складі</h2>
        <div className="flex gap-2">
          <Dialog open={roastOpen} onOpenChange={setRoastOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={greenCoffee.length === 0}>
                <Flame className="h-4 w-4 mr-1" /> Обсмажити
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Обсмажити каву</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Оберіть каву</Label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-lg bg-background" value={roastId} onChange={(e) => setRoastId(e.target.value)}>
                    <option value="">—</option>
                    {greenCoffee.filter((g) => g.weightKg > 0).map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.weightKg.toFixed(1)} кг)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Вага зеленої кави (кг)</Label>
                  <Input type="number" step="0.1" value={roastWeight} onChange={(e) => setRoastWeight(e.target.value)} max={selectedGreen?.weightKg} />
                  {roastWeight && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Вихід після обсмажки: <strong>{(parseFloat(roastWeight || "0") * 0.8).toFixed(1)} кг</strong> (−20%)
                    </p>
                  )}
                </div>
                <div>
                  <Label>Ціна смаженої (₴/кг)</Label>
                  <Input type="number" step="1" value={roastPrice} onChange={(e) => setRoastPrice(e.target.value)} />
                </div>
                <Button onClick={handleRoast} className="w-full">Обсмажити</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Додати</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Додати зелену каву</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Назва</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ethiopia Yirgacheffe" /></div>
                <div><Label>Походження</Label><Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ефіопія" /></div>
                <div><Label>Вага (кг)</Label><Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} /></div>
                <div><Label>Ціна (₴/кг)</Label><Input type="number" step="1" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                <Button onClick={handleAdd} className="w-full">Додати</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редагувати зелену каву</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Назва</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>Походження</Label><Input value={editOrigin} onChange={(e) => setEditOrigin(e.target.value)} /></div>
            <div><Label>Вага (кг)</Label><Input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} /></div>
            <div><Label>Ціна (₴/кг)</Label><Input type="number" step="1" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} /></div>
            <Button onClick={handleEdit} className="w-full">Зберегти</Button>
          </div>
        </DialogContent>
      </Dialog>

      {greenCoffee.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Склад порожній. Додайте зелену каву.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {greenCoffee.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.origin || "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-coffee-green">{c.weightKg.toFixed(1)} кг</p>
                    <p className="text-sm text-muted-foreground">{c.pricePerKg} ₴/кг</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
