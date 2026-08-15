import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { DataTable, type Column } from "@/components/common/data-table";
import { TablePagination } from "@/components/common/table-pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/api/customers";
import { customersQuery } from "@/lib/queries";
import { currency } from "@/lib/format";
import type { Customer } from "@/lib/mock/types";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/customers")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Customers — SmartBiz ERP Lite" },
      { name: "description", content: "Keep customer contacts and credit balances up to date." },
      { property: "og:title", content: "Customers — SmartBiz ERP Lite" },
      { property: "og:description", content: "Manage customer records and outstanding credit." },
    ],
  }),
  component: CustomersPage,
});

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  address: z.string().max(160, "Keep it under 160 characters"),
  tinNumber: z.string().max(50, "Keep it under 50 characters").or(z.literal("")),
  creditBalance: z.coerce.number().min(0, "Must be 0 or more"),
});
type FormValues = z.input<typeof schema>;

const PAGE_SIZE = 8;

function CustomersPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === "admin";
  const customers = useQuery(customersQuery);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", address: "", tinNumber: "", creditBalance: 0 },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["customers"] });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const parsed = schema.parse(values);
      return editing ? updateCustomer(editing.id, parsed) : createCustomer(parsed);
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? t("customers.updated") : t("customers.created"));
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Could not save customer", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      invalidate();
      toast.success(t("customers.deleted"));
      setDeleting(null);
    },
    onError: (error: Error) => {
      toast.error("Could not delete customer", {
        description: error.message,
      });
    },
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (customers.data ?? []).filter(
      (c) =>
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.tinNumber.toLowerCase().includes(term),
    );
  }, [customers.data, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", phone: "", email: "", address: "", tinNumber: "", creditBalance: 0 });
    setDialogOpen(true);
  };

  const openEdit = (row: Customer) => {
    setEditing(row);
    form.reset({
      name: row.name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      tinNumber: row.tinNumber,
      creditBalance: row.creditBalance,
    });
    setDialogOpen(true);
  };

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Customer",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email || t("common.noEmail")}</p>
        </div>
      ),
    },
    { key: "phone", header: t("common.phone"), cell: (row) => row.phone },
    {
      key: "tin",
      header: t("customers.tin"),
      cell: (row) => (
        <span className="text-muted-foreground">{row.tinNumber || "—"}</span>
      ),
    },
    {
      key: "address",
      header: "Address",
      cell: (row) => <span className="text-muted-foreground">{row.address || "—"}</span>,
    },
    {
      key: "credit",
      header: t("customers.creditBalance"),
      cell: (row) => (
        <span className={row.creditBalance > 0 ? "font-medium text-destructive" : "text-muted-foreground"}>
          {currency(row.creditBalance)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => openEdit(row)}>
            <Pencil className="size-4" />
          </Button>
          {isAdmin ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("common.delete")}
              className="text-destructive"
              onClick={() => setDeleting(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageHeader
        title={t("customers.title")}
        description={t("customers.description")}
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t("customers.new")}
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        placeholder={t("customers.searchPlaceholder")}
      />

      <DataTable
        columns={columns}
        rows={paged}
        isLoading={customers.isLoading}
        isError={customers.isError}
        onRetry={() => customers.refetch()}
        emptyState={
          <EmptyState
            icon={Users}
            title={t("customers.noCustomers")}
            description={t("customers.noCustomersDesc")}
            actionLabel={t("customers.new")}
            onAction={openCreate}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("customers.edit") : t("customers.new")}</DialogTitle>
            <DialogDescription>{t("customers.creditDesc")}</DialogDescription>
          </DialogHeader>
          <form
            id="customer-form"
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          >
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" {...form.register("name")} />
              <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
              <p className="text-xs text-destructive">{form.formState.errors.phone?.message}</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input id="email" type="email" {...form.register("email")} />
              <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">{t("common.address")}</Label>
              <Textarea id="address" rows={2} {...form.register("address")} />
              <p className="text-xs text-destructive">{form.formState.errors.address?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tinNumber">{t("customers.tin")}</Label>
              <Input id="tinNumber" {...form.register("tinNumber")} />
              <p className="text-xs text-destructive">{form.formState.errors.tinNumber?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditBalance">{t("customers.creditBalance")}</Label>
              <Input
                id="creditBalance"
                type="number"
                step="0.01"
                {...form.register("creditBalance")}
              />
              <p className="text-xs text-destructive">
                {form.formState.errors.creditBalance?.message}
              </p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="customer-form" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t("common.saving") : t("customers.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={deleting ? `${t("common.delete")} ${deleting.name}?` : t("customers.deleteTitle")}
        description={t("customers.deleteDesc")}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </AppLayout>
  );
}
