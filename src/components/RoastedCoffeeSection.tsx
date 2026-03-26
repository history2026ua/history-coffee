import { Card, CardContent } from "@/components/ui/card";
import type { RoastedCoffee } from "@/lib/store";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

interface Props {
  roastedCoffee: RoastedCoffee[];
}

export default function RoastedCoffeeSection({ roastedCoffee }: Props) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Смажена кава</h2>
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
