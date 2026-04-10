import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RoastedCoffee, GreenCoffee } from "@/lib/store";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Props {
  roastedCoffee: RoastedCoffee[];
  greenCoffee: GreenCoffee[];
  onAdd: (coffee: Omit<RoastedCoffee, "id" | "roastedAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<RoastedCoffee, "id" | "roastedAt">>) => void;
  onDelete: (id: string) => void;
}

export default function RoastedCoffeeSection({ roastedCoffee, greenCoffee, onAdd, onUpdate, onDelete }: Props) {
  const [selectedGreenId, setSelectedGreenId] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<RoastedCoffee | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const selectedGreen = greenCoffee.find((g) => g.id === selectedGreenId);
  const greenNeeded = weightKg ? (parseFloat(weightKg) / 0.8) : 0;
  const hasEnoughGreen = selectedGreen ? selectedGreen.weightKg >= greenNeeded : false;

  const handleAdd = () => {
    if (!selectedGreenId || !weightKg || !pricePerKg || !hasEnoughGreen) return;
    onAdd({
      sourceGreenId: selectedGreenId,
      name: (selectedGreen?.name || "") + " (обсмажена)",
      weightKg: parseFloat(weightKg),
      pricePerKg: parseFloat(pricePerKg),
    });
    setSelectedGreenId("");
    setWeightKg("");
    setPricePerKg("");
  };

  const openEdit = (item: RoastedCoffee) => {
    setEditItem(item);
    setEditName(item.name);
    setEditWeight(String(item.weightKg));
    setEditPrice(String(item.pricePerKg));
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editItem || !editName || !editWeight || !editPrice) return;
    onUpdate(editItem.id, { name: editName, weightKg: parseFloat(editWeight), pricePerKg: parseFloat(editPrice) });
    setEditOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Смажена кава</h2>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Додати смажену каву</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Зелена кава</Label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-background text-sm"
                value={selectedGreenId}
                onChange={(e) => setSelectedGreenId(e.target.value)}
              >
                <option value="">— Оберіть —</option>
                {greenCoffee.filter((g) => g.weightKg > 0).map((g) => (
                  <option key={g.id} value={g.id}>{g.name} ({g.weightKg.toFixed(1)} кг)</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Вага смаженої (кг)</Label>
              <Input type="number" step="0.1" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="0.0" />
              {weightKg && (
                <p className={`text-xs mt-1 ${hasEnoughGreen ? 'text-muted-foreground' : 'text-destructive'}`}>
                  Потрібно зеленої: <strong>{greenNeeded.toFixed(1)} кг</strong>
                  {selectedGreen && !hasEnoughGreen && ` (є лише ${selectedGreen.weightKg.toFixed(1)} кг)`}
                </p>
              )}
            </div>
            <div>
              <Label>Ціна за кг (₴)</Label>
              <Input type="number" step="1" min="0" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="0" />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!selectedGreenId || !weightKg || !pricePerKg || !hasEnoughGreen} className="gap-1.5">
            <Plus className="h-4 w-4" /> Додати
          </Button>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редагувати смажену каву</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Назва</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>Вага (кг)</Label><Input type="number" step="0.1" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} /></div>
            <div><Label>Ціна (₴/кг)</Label><Input type="number" step="1" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} /></div>
            <Button onClick={handleEdit} className="w-full">Зберегти</Button>
          </div>
        </DialogContent>
      </Dialog>

      {roastedCoffee.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Ще не обсмажено жодної партії.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {roastedCoffee.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Обсмажено: {format(new Date(c.roastedAt), "dd.MM.yyyy", { locale: uk })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-coffee-roasted">{c.weightKg.toFixed(1)} кг</p>
                    <p className="text-sm text-muted-foreground">{c.pricePerKg} ₴/кг</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(c.id)}>
                    <Trash2 className="h-4 w-4" />
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
