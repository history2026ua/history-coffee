import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Coffee, Users, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { AppState } from "@/lib/store";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { uk } from "date-fns/locale";

interface Props {
  state: AppState;
}

export default function Dashboard({ state }: Props) {
  const totalGreen = state.greenCoffee.reduce((s, c) => s + c.weightKg, 0);
  const totalRoasted = state.roastedCoffee.reduce((s, c) => s + c.weightKg, 0);
  const totalRevenue = state.sales.reduce((s, c) => s + c.totalPrice, 0);
  const totalExpenses = state.expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalClients = state.clients.length;

  const chartData = useMemo(() => {
    const days = 14;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayEnd = new Date(day.getTime() + 86400000);
      const daySales = state.sales.filter((s) => {
        const d = new Date(s.date);
        return d >= day && d < dayEnd;
      });
      const dayExpenses = state.expenses.filter((e) => {
        const d = new Date(e.date);
        return d >= day && d < dayEnd;
      });
      data.push({
        date: format(day, "dd.MM", { locale: uk }),
        revenue: Math.round(daySales.reduce((s, c) => s + c.totalPrice, 0)),
        expenses: Math.round(dayExpenses.reduce((s, e) => s + e.amount, 0)),
        weight: parseFloat(daySales.reduce((s, c) => s + c.weightKg, 0).toFixed(1)),
      });
    }
    return data;
  }, [state.sales, state.expenses]);

  const stats = [
    { label: "Зелена кава", value: `${totalGreen.toFixed(1)} кг`, icon: Package, color: "text-coffee-green" },
    { label: "Смажена кава", value: `${totalRoasted.toFixed(1)} кг`, icon: Coffee, color: "text-coffee-roasted" },
    { label: "Клієнти", value: totalClients, icon: Users, color: "text-primary" },
    { label: "Дохід", value: `${totalRevenue.toFixed(0)} ₴`, icon: TrendingUp, color: "text-accent" },
    { label: "Витрати", value: `${totalExpenses.toFixed(0)} ₴`, icon: TrendingDown, color: "text-destructive" },
    { label: "Чистий прибуток", value: `${netProfit.toFixed(0)} ₴`, icon: DollarSign, color: netProfit >= 0 ? "text-success" : "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Продажі за 14 днів</CardTitle>
        </CardHeader>
        <CardContent>
          {state.sales.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Ще немає продажів</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 85%)" />
                <XAxis dataKey="date" fontSize={12} stroke="hsl(25 10% 45%)" />
                <YAxis fontSize={12} stroke="hsl(25 10% 45%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(30 20% 99%)",
                    border: "1px solid hsl(30 15% 85%)",
                    borderRadius: "0.75rem",
                  }}
                  formatter={(value: number, name: string) => [
                    name === "revenue" ? `${value} ₴` : `${value} кг`,
                    name === "revenue" ? "Виручка" : "Вага",
                  ]}
                />
                <Bar dataKey="revenue" fill="hsl(25 60% 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {state.sales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Останні продажі</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {state.sales
                .slice(-5)
                .reverse()
                .map((sale) => {
                  const client = state.clients.find((c) => c.id === sale.clientId);
                  const coffee =
                    sale.coffeeType === "green"
                      ? state.greenCoffee.find((c) => c.id === sale.coffeeId)
                      : state.roastedCoffee.find((c) => c.id === sale.coffeeId);
                  return (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{client?.name ?? "—"}</span>
                        <span className="text-muted-foreground ml-2 text-sm">
                          {coffee?.name ?? "—"} · {sale.weightKg} кг
                        </span>
                      </div>
                      <div className="font-semibold">{sale.totalPrice.toFixed(0)} ₴</div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
