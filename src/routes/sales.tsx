import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { DataTable, type Column } from "@/components/common/data-table";
import { TablePagination } from "@/components/common/table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currency } from "@/lib/format";
import { createSale, type Sale } from "@/lib/api/sales";
import {
  customersQuery,
  paymentMethodsQuery,
  productsQuery,
  salesQuery,
} from "@/lib/queries";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/sales")({
  beforeLoad: requireAuth,
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
  cash: "bg-success/15 text-success",
  paid: "bg-success/15 text-success",
  pending: "bg-warning/20 text-warning-foreground",
  partial: "bg-primary/15 text-primary",
};

const PAGE_SIZE = 8;

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "credit", label: "Credit" },
  { value: "telebirr", label: "Telebirr" },
] as const;

interface LineItem {
  key: string;
  productId: string;
  quantity: number;
}

const newLine = (): LineItem => ({
  key: Math.random().toString(36).slice(2, 8),
  productId: "",
  quantity: 1,
});

function SalesPage() {
  const qc = useQueryClient();
  const sales = useQuery(salesQuery);
  const customers = useQuery(customersQuery);
  const products = useQuery(productsQuery);
  const paymentMethods = useQuery(paymentMethodsQuery);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [lines, setLines] = useState<LineItem[]>([newLine()]);

  const methodOptions = paymentMethods.data ?? [];

  const customerName = (id: string | null) =>
    (customers.data ?? []).find((c) => c.id === id)?.name ?? "Walk-in customer";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (sales.data ?? []).filter((s) => {
      const matchesTerm =
        !term ||
        s.invoiceNumber.toLowerCase().includes(term) ||
        customerName(s.customerId).toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || s.paymentMethod === statusFilter;
      return matchesTerm && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales.data, customers.data, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const productOf = (productId: string) =>
    (products.data ?? []).find((p) => p.id === productId);

  const priceOf = (productId: string) => productOf(productId)?.sellingPrice ?? 0;

  const total = lines.reduce(
    (sum, l) => sum + priceOf(l.productId) * (Number.isFinite(l.quantity) ? l.quantity : 0),
    0,
  );

  const resetForm = () => {
    setCustomerId("");
    setPaymentMethod("");
    setLines([newLine()]);
  };

  const saveSale = useMutation({
    mutationFn: () =>
      createSale({
        customerId: customerId || null,
        paymentMethod,
        lines: lines
          .filter((l) => l.productId && l.quantity > 0)
          .map((l) => {
            const product = productOf(l.productId);
            return {
              productId: l.productId,
              quantity: l.quantity,
              sellingPrice: product?.sellingPrice ?? 0,
              buyingPrice: product?.buyingPrice ?? 0,
            };
          }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["inventory-logs"] });
      toast.success("Sale recorded");
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      // Stock could still have changed on a partial failure, so refresh reads.
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["inventory-logs"] });
      toast.error(error.message || "Could not record the sale");
    },

  });

  const canSubmit =
    Boolean(paymentMethod) && total > 0 && lines.some((l) => l.productId && l.quantity > 0);

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
      header: "Payment method",
      cell: (row) => (
        <Badge variant="secondary" className={tone[row.paymentMethod]}>
          {row.paymentMethod}
        </Badge>
      ),
    },
    { key: "date", header: "Date", cell: (row) => row.date },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Sales"
        description="Invoice history. Recording a sale saves the invoice and its line items — stock deduction comes later."
        actions={
          <Button
            onClick={() => {
              resetForm();
              setDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add sale
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search invoice or customer"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filter by payment method">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {methodOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            actionLabel="Add sale"
            onAction={() => {
              resetForm();
              setDialogOpen(true);
            }}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New sale</DialogTitle>
            <DialogDescription>
              Pick a customer, add products and confirm the invoice total.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger aria-label="Select customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {(customers.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method" aria-label="Select payment method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Line items</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLines((prev) => [...prev, newLine()])}
                >
                  <Plus className="size-4" />
                  Add item
                </Button>
              </div>

              {lines.map((line) => (
                <div key={line.key} className="grid gap-2 sm:grid-cols-[1fr_5rem_6rem_2.5rem]">
                  <Select
                    value={line.productId}
                    onValueChange={(v) =>
                      setLines((prev) =>
                        prev.map((l) => (l.key === line.key ? { ...l, productId: v } : l)),
                      )
                    }
                  >
                    <SelectTrigger aria-label="Select product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {(products.data ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {currency(p.sellingPrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    aria-label="Quantity"
                    value={line.quantity}
                    onChange={(e) =>
                      setLines((prev) =>
                        prev.map((l) =>
                          l.key === line.key
                            ? { ...l, quantity: Math.max(0, Number(e.target.value)) }
                            : l,
                        ),
                      )
                    }
                  />
                  <div className="flex items-center justify-end px-2 text-sm font-medium sm:justify-center">
                    {currency(priceOf(line.productId) * (line.quantity || 0))}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove line"
                    className="text-destructive"
                    disabled={lines.length === 1}
                    onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-foreground">{currency(total)}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!canSubmit || saveSale.isPending} onClick={() => saveSale.mutate()}>
              {saveSale.isPending ? "Saving..." : "Save sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
