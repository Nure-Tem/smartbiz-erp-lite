import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { DataTable, type Column } from "@/components/common/data-table";
import { TablePagination } from "@/components/common/table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { currency } from "@/lib/format";
import { customersQuery, salesQuery } from "@/lib/mock/queries";
import type { Sale } from "@/lib/mock/types";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales — SmartBiz ERP Lite" },
      { name: "description", content: "Review invoices, totals and payment status for every sale." },
      { property: "og:title", content: "Sales — SmartBiz ERP Lite" },
      { property: "og:description", content: "Invoice list with payment status tracking." },
    ],
  }),
  component: SalesPage,
});

const tone: Record<string, string> = {
  paid: "bg-success/15 text-success",
  pending: "bg-warning/20 text-warning-foreground",
  partial: "bg-primary/15 text-primary",
};

const PAGE_SIZE = 8;

function SalesPage() {
  const sales = useQuery(salesQuery);
  const customers = useQuery(customersQuery);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const customerName = (id: string) =>
    (customers.data ?? []).find((c) => c.id === id)?.name ?? "Walk-in customer";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (sales.data ?? []).filter(
      (s) =>
        !term ||
        s.invoiceNumber.toLowerCase().includes(term) ||
        customerName(s.customerId).toLowerCase().includes(term),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales.data, customers.data, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<Sale>[] = [
    {
      key: "invoice",
      header: "Invoice",
      cell: (row) => <span className="font-medium text-foreground">{row.invoiceNumber}</span>,
    },
    { key: "customer", header: "Customer", cell: (row) => customerName(row.customerId) },
    {
      key: "total",
      header: "Total",
      cell: (row) => <span className="font-semibold">{currency(row.total)}</span>,
    },
    {
      key: "status",
      header: "Payment status",
      cell: (row) => (
        <Badge variant="secondary" className={tone[row.paymentStatus]}>
          {row.paymentStatus}
        </Badge>
      ),
    },
    { key: "date", header: "Date", cell: (row) => row.date },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Sales"
        description="Invoice history — sales processing arrives in the next milestone."
        actions={
          <Button onClick={() => toast.info("Sales processing lands in the next milestone.")}>
            <Plus className="size-4" />
            Add sale
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder="Search invoice or customer"
      />

      <DataTable
        columns={columns}
        rows={paged}
        isLoading={sales.isLoading}
        isError={sales.isError}
        onRetry={() => sales.refetch()}
        emptyState={
          <EmptyState
            icon={ShoppingCart}
            title="No sales found"
            description="Invoices will appear here once sales are recorded."
          />
        }
        footer={
          <TablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            onPageChange={setPage}
          />
        }
      />
    </AppLayout>
  );
}
