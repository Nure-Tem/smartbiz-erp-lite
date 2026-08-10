import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { currency } from "@/lib/format";
import { revenueTrend, weeklyOrders } from "@/lib/mock/db";
import { customersQuery, productsQuery, salesQuery } from "@/lib/queries";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Dashboard — SmartBiz ERP Lite" },
      {
        name: "description",
        content:
          "Track products, customers, sales and revenue at a glance in the SmartBiz ERP Lite dashboard.",
      },
      { property: "og:title", content: "Dashboard — SmartBiz ERP Lite" },
      {
        property: "og:description",
        content: "Inventory and sales management dashboard for small and medium businesses.",
      },
    ],
  }),
  component: DashboardPage,
});

const statusTone: Record<string, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/20 text-warning-foreground",
  partial: "bg-primary/15 text-primary",
};

function DashboardPage() {
  const products = useQuery(productsQuery);
  const customers = useQuery(customersQuery);
  const sales = useQuery(salesQuery);

  const loading = products.isLoading || customers.isLoading || sales.isLoading;

  const stats = useMemo(() => {
    const p = products.data ?? [];
    const s = sales.data ?? [];
    return {
      products: p.length,
      customers: (customers.data ?? []).length,
      sales: s.length,
      revenue: s.reduce((sum, row) => sum + row.total, 0),
      lowStock: p.filter((row) => row.stock <= row.minStock),
    };
  }, [products.data, customers.data, sales.data]);

  const customerName = (id: string) =>
    (customers.data ?? []).find((c) => c.id === id)?.name ?? "Walk-in customer";

  const cards = [
    { label: "Total Products", value: String(stats.products), icon: Package, hint: "+4 this month" },
    { label: "Total Customers", value: String(stats.customers), icon: Users, hint: "+2 this month" },
    { label: "Total Sales", value: String(stats.sales), icon: ShoppingCart, hint: "+18% vs July" },
    { label: "Revenue", value: currency(stats.revenue), icon: DollarSign, hint: "+11% vs July" },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="An overview of your inventory, customers and sales performance."
      />

      {loading ? (
        <LoadingSpinner label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, hint }) => (
              <Card key={label} className="rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-foreground">{value}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <ArrowUpRight className="size-3" />
                    {hint}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-xl lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>Revenue against cost of goods, last 7 months</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{ left: -18, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        color: "var(--color-popover-foreground)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--color-primary)"
                      fill="url(#rev)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="var(--color-accent)"
                      fill="url(#cost)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Orders this week</CardTitle>
                <CardDescription>Daily order volume</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyOrders} margin={{ left: -22, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)" }}
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 12,
                        color: "var(--color-popover-foreground)",
                      }}
                    />
                    <Bar dataKey="orders" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-xl lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent sales</CardTitle>
                <CardDescription>Latest invoices raised</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(sales.data ?? []).slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {customerName(sale.customerId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.invoiceNumber} · {sale.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusTone[sale.paymentStatus]} variant="secondary">
                        {sale.paymentStatus}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        {currency(sale.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TriangleAlert className="size-4 text-warning" />
                  Low stock products
                </CardTitle>
                <CardDescription>{stats.lowStock.length} items need restocking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.lowStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                      {product.stock}/{product.minStock}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AppLayout>
  );
}
