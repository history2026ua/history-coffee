import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import type { Client, Sale, GreenCoffee, RoastedCoffee } from "@/lib/store";

interface Props {
  clients: Client[];
  sales: Sale[];
  greenCoffee: GreenCoffee[];
  roastedCoffee: RoastedCoffee[];
  onAdd: (client: Omit<Client, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Omit<Client, "id" | "createdAt">>) => void;
}

export default function ClientsSection({ clients, sales, greenCoffee, roastedCoffee, onAdd, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Client | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const handleAdd = () => {
    if (!name) return;
    onAdd({ name, phone, email });
    setName(""); setPhone(""); setEmail("");
    setOpen(false);
  };

  const openEdit = (item: Client) => {
    setEditItem(item);
    setEditName(item.name);
    setEditPhone(item.phone);
    setEditEmail(item.email);
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editItem || !editName) return;
    onUpdate(editItem.id, { name: editName, phone: editPhone, email: editEmail });
    setEditOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Клієнти</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Додати</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новий клієнт</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Ім'я</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Телефон</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <Button onClick={handleAdd} className="w-full">Додати клієнта</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редагувати клієнта</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Ім'я</Label><Input value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
            <div><Label>Телефон</Label><Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} /></div>
            <Button onClick={handleEdit} className="w-full">Зберегти</Button>
          </div>
        </DialogContent>
      </Dialog>

      {clients.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Немає клієнтів.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((c) => {
            const clientSales = sales.filter((s) => s.clientId === c.id);
            const totalSpent = clientSales.reduce((s, sale) => s + sale.totalPrice, 0);
            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.phone || c.email || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{clientSales.length} замовлень</p>
                        <p className="font-bold">{totalSpent.toFixed(0)} ₴</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
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
