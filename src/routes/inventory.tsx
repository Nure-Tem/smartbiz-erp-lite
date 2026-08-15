import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Warehouse } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { DataTable, type Column } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { StockBadge } from "@/components/common/status-badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inventoryLogsQuery, productsQuery } from "@/lib/queries";
import type { InventoryLog } from "@/lib/api/inventory";
import type { Product } from "@/lib/mock/types";
import { requireAuth } from "@/lib/route-guards";


export const Route = createFileRoute("/inventory")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Inventory — SmartBiz ERP Lite" },
      { name: "description", content: "Monitor stock levels and restocking thresholds." },
      { property: "og:title", content: "Inventory — SmartBiz ERP Lite" },
      { property: "og:description", content: "Stock status overview across your catalogue." },
    ],
  }),
  component: InventoryPage,
});

function statusOf(p: Product) {
  if (p.stock === 0) return { label: "Out of stock", level: "out" as const };
  if (p.stock <= p.minStock) return { label: "Low stock", level: "low" as const };
  return { label: "In stock", level: "ok" as const };
}

function InventoryPage() {
  const products = useQuery(productsQuery);
  const logs = useQuery(inventoryLogsQuery);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const keyOf = (p: Product) =>
    p.stock === 0 ? "out" : p.stock <= p.minStock ? "low" : "in";

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data ?? []).filter(
      (p) =>
        (!term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term)) &&
        (statusFilter === "all" || keyOf(p) === statusFilter),
    );
  }, [products.data, search, statusFilter]);


  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.sku}</p>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Current stock",
      cell: (row) => (
        <div className="w-40 space-y-1">
          <p className="text-sm font-medium">{row.stock}</p>
          <Progress value={Math.min(100, (row.stock / Math.max(1, row.minStock * 3)) * 100)} />
        </div>
      ),
    },
    { key: "min", header: "Minimum stock", cell: (row) => row.minStock },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const s = statusOf(row);
        return (
          <StockBadge level={s.level} label={s.label} />

        );
      },
    },
  ];

  const logColumns: Column<InventoryLog>[] = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.productName}</p>
          <p className="text-xs text-muted-foreground">{row.productSku}</p>
        </div>
      ),
    },
    {
      key: "movement",
      header: "Movement",
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {row.movementType.replace(/_/g, " ")}
        </Badge>
      ),
    },
    { key: "quantity", header: "Quantity", cell: (row) => row.quantity },
    {
      key: "change",
      header: "Stock change",
      cell: (row) => (
        <span className="text-sm">
          {row.previousStock} → <span className="font-medium">{row.newStock}</span>
        </span>
      ),
    },
    { key: "reason", header: "Reason", cell: (row) => row.reason ?? "—" },
    {
      key: "date",
      header: "Date",
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];



  return (
    <AppLayout>
      <PageHeader
        title="Inventory"
        description="Stock health across your catalogue, plus recent stock movements from sales."
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search product or SKU" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" aria-label="Filter by stock status">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="in">In stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        isLoading={products.isLoading}
        isError={products.isError}
        onRetry={() => products.refetch()}
        emptyState={
          <EmptyState
            icon={Warehouse}
            title="No products match these filters"
            description="Try a different search term or stock status."
          />
        }
      />

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            Stock movements
          </CardTitle>
          <CardDescription>Latest inventory changes recorded in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={logColumns}
            rows={logs.data ?? []}
            isLoading={logs.isLoading}
            isError={logs.isError}
            onRetry={() => logs.refetch()}
            emptyState={
              <EmptyState
                icon={History}
                title="No stock movements yet"
                description="Movements appear here whenever stock changes, for example after a sale."
              />
            }
          />
        </CardContent>
      </Card>

    </AppLayout>
  );
}
