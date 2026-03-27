import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RoastedCoffee } from "@/lib/store";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Plus } from "lucide-react";

interface Props {
  roastedCoffee: RoastedCoffee[];
  onAdd: (coffee: Omit<RoastedCoffee, "id" | "roastedAt">) => void;
}

export default function RoastedCoffeeSection({ roastedCoffee, onAdd }: Props) {
  const [name, setName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");

  const handleAdd = () => {
    if (!name || !weightKg || !pricePerKg) return;
    onAdd({ sourceGreenId: "", name, weightKg: parseFloat(weightKg), pricePerKg: parseFloat(pricePerKg) });
    setName("");
    setWeightKg("");
    setPricePerKg("");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Смажена кава</h2>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Додати смажену каву</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Назва</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Назва кави" />
            </div>
            <div>
              <Label>Вага (кг)</Label>
              <Input type="number" step="0.1" min="0" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="0.0" />
            </div>
            <div>
              <Label>Ціна за кг (₴)</Label>
              <Input type="number" step="1" min="0" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} placeholder="0" />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!name || !weightKg || !pricePerKg} className="gap-1.5">
            <Plus className="h-4 w-4" /> Додати
          </Button>
        </CardContent>
      </Card>

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
                <div className="text-right">
                  <p className="font-bold text-coffee-roasted">{c.weightKg.toFixed(1)} кг</p>
                  <p className="text-sm text-muted-foreground">{c.pricePerKg} ₴/кг</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
