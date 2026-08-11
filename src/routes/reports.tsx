import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { categoriesQuery, productsQuery, salesQuery } from "@/lib/queries";
import {
  costOfGoodsSold,
  ordersByDay,
  revenueByCategory,
  revenueByMonth,
} from "@/lib/analytics";
import { currency } from "@/lib/format";

import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/reports")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Reports — SmartBiz ERP Lite" },
      { name: "description", content: "Visual reports on revenue, orders and category mix." },
      { property: "og:title", content: "Reports — SmartBiz ERP Lite" },
      { property: "og:description", content: "Charts for revenue trends and category performance." },
    ],
  }),
  component: ReportsPage,
});

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  color: "var(--color-popover-foreground)",
};

const PIE_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function ReportsPage() {
  const sales = useQuery(salesQuery);
  const products = useQuery(productsQuery);

  const salesRows = sales.data ?? [];
  const productRows = products.data ?? [];

  const revenue = revenueTrend.reduce((s, r) => s + r.revenue, 0);
  const cost = revenueTrend.reduce((s, r) => s + r.cost, 0);
  const invoiceTotal = salesRows.reduce((s, r) => s + r.total, 0);
  const avgOrder = salesRows.length ? invoiceTotal / salesRows.length : 0;
  const lowStock = productRows.filter((p) => p.stock <= p.minStock).length;
  const stockValue = productRows.reduce((s, p) => s + p.buyingPrice * p.stock, 0);

  const summary = [
    { label: "Revenue (7 months)", value: currency(revenue), hint: "Mock trend data" },
    { label: "Gross margin", value: currency(revenue - cost), hint: "Revenue minus cost" },
    {
      label: "Invoices",
      value: String(salesRows.length),
      hint: `Avg ${currency(avgOrder)} per sale`,
    },
    {
      label: "Inventory value",
      value: currency(stockValue),
      hint: `${productRows.length} products · ${lowStock} low stock`,
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Reports"
        description="Placeholder analytics — wired to live data once the backend is connected."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label} className="rounded-xl">
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl">
                {sales.isLoading || products.isLoading ? "—" : s.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>



      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Revenue by month</CardTitle>
            <CardDescription>Last 7 months</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="cost" stroke="var(--color-accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Sales by category</CardTitle>
            <CardDescription>Share of revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Pie
                  data={salesByCategory}
                  dataKey="value"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {salesByCategory.map((entry, i) => (
                    <Cell key={entry.category} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders per day</CardTitle>
            <CardDescription>Current week</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyOrders} margin={{ left: -22, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="orders" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
