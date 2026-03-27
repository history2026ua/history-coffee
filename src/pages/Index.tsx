import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Package, Coffee, Users, ShoppingCart, Receipt } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import GreenCoffeeSection from "@/components/GreenCoffeeSection";
import RoastedCoffeeSection from "@/components/RoastedCoffeeSection";
import ClientsSection from "@/components/ClientsSection";
import SalesSection from "@/components/SalesSection";
import ExpensesSection from "@/components/ExpensesSection";

export default function Index() {
  const store = useAppStore();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Coffee className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">КавоОблік</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> Дашборд
            </TabsTrigger>
            <TabsTrigger value="green" className="gap-1.5">
              <Package className="h-4 w-4" /> Зелена кава
            </TabsTrigger>
            <TabsTrigger value="roasted" className="gap-1.5">
              <Coffee className="h-4 w-4" /> Смажена
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5">
              <Users className="h-4 w-4" /> Клієнти
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-1.5">
              <ShoppingCart className="h-4 w-4" /> Продажі
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-1.5">
              <Receipt className="h-4 w-4" /> Витрати
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard state={store} />
          </TabsContent>
          <TabsContent value="green">
            <GreenCoffeeSection greenCoffee={store.greenCoffee} onAdd={store.addGreenCoffee} onRoast={store.roastCoffee} />
          </TabsContent>
          <TabsContent value="roasted">
            <RoastedCoffeeSection roastedCoffee={store.roastedCoffee} onAdd={store.addRoastedCoffee} />
          </TabsContent>
          <TabsContent value="clients">
            <ClientsSection clients={store.clients} sales={store.sales} greenCoffee={store.greenCoffee} roastedCoffee={store.roastedCoffee} onAdd={store.addClient} />
          </TabsContent>
          <TabsContent value="sales">
            <SalesSection clients={store.clients} sales={store.sales} greenCoffee={store.greenCoffee} roastedCoffee={store.roastedCoffee} onAdd={store.addSale} />
          </TabsContent>
          <TabsContent value="expenses">
            <ExpensesSection expenses={store.expenses} onAdd={store.addExpense} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
