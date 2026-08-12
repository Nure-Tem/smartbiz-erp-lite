import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import { currency } from "@/lib/format";
import type { Product } from "@/lib/mock/types";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/products")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Products — SmartBiz ERP Lite" },
      { name: "description", content: "Manage your product catalogue, pricing and stock levels." },
      { property: "og:title", content: "Products — SmartBiz ERP Lite" },
      { property: "og:description", content: "Create, edit and track products with stock alerts." },
    ],
  }),
  component: ProductsPage,
});

const schema = z.object({
  name: z.string().min(2, "Product name is required"),
  sku: z.string().min(2, "SKU is required"),
  imageUrl: z.string().url("Enter a valid image URL").or(z.literal("")),
  categoryId: z.string().min(1, "Select a category"),
  buyingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Must be 0 or more"),
  stock: z.coerce.number().int().min(0, "Must be 0 or more"),
  minStock: z.coerce.number().int().min(0, "Must be 0 or more"),
});
type FormValues = z.input<typeof schema>;

const PAGE_SIZE = 8;

function ProductsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const products = useQuery(productsQuery);
  const categories = useQuery(categoriesQuery);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      sku: "",
      imageUrl: "",
      categoryId: "",
      buyingPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 0,
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["products"] });

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const parsed = schema.parse(values);
      const payload = {
        ...parsed,
        imageUrl: parsed.imageUrl || "https://picsum.photos/seed/product/200/200",
      };
      return editing ? updateProduct(editing.id, payload) : createProduct(payload);
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Product updated" : "Product created");
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Could not save product", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted");
      setDeleting(null);
    },
    onError: (error: Error) => {
      toast.error("Could not delete product", {
        description: error.message,
      });
    },
  });

  const categoryName = (id: string) =>
    (categories.data ?? []).find((c) => c.id === id)?.name ?? "Uncategorised";

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (products.data ?? []).filter((p) => {
      const matchesTerm =
        !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stock <= p.minStock) ||
        (stockFilter === "ok" && p.stock > p.minStock);
      return matchesTerm && matchesCategory && matchesStock;
    });
  }, [products.data, search, categoryFilter, stockFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      sku: "",
      imageUrl: "",
      categoryId: categories.data?.[0]?.id ?? "",
      buyingPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (row: Product) => {
    setEditing(row);
    form.reset({
      name: row.name,
      sku: row.sku,
      imageUrl: row.imageUrl,
      categoryId: row.categoryId,
      buyingPrice: row.buyingPrice,
      sellingPrice: row.sellingPrice,
      stock: row.stock,
      minStock: row.minStock,
    });
    setDialogOpen(true);
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Product",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.imageUrl}
            alt={row.name}
            loading="lazy"
            className="size-10 rounded-lg border border-border object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.sku}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (row) => categoryName(row.categoryId) },
    { key: "buying", header: "Buying", cell: (row) => currency(row.buyingPrice) },
    {
      key: "selling",
      header: "Selling",
      cell: (row) => <span className="font-medium">{currency(row.sellingPrice)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.stock}</span>
          {row.stock <= row.minStock ? (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive">
              Low
            </Badge>
          ) : null}
        </div>
      ),
    },
    { key: "min", header: "Min stock", cell: (row) => row.minStock },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => openEdit(row)}>
            <Pencil className="size-4" />
          </Button>
          {isAdmin ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete"
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

  const numberField = (
    field: "buyingPrice" | "sellingPrice" | "stock" | "minStock",
    label: string,
    step?: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <Input id={field} type="number" step={step ?? "1"} {...form.register(field)} />
      <p className="text-xs text-destructive">{form.formState.errors[field]?.message}</p>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader
        title="Products"
        description="Your catalogue with pricing, stock levels and low-stock alerts."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New product
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
          placeholder="Search name or SKU"
        />
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(categories.data ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={stockFilter}
          onValueChange={(v) => {
            setStockFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="ok">In stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={paged}
        isLoading={products.isLoading}
        isError={products.isError}
        onRetry={() => products.refetch()}
        emptyState={
          <EmptyState
            icon={Package}
            title="No products match your filters"
            description="Try a different search term or add a new product."
            actionLabel="New product"
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            <DialogDescription>
              Pricing and stock thresholds power your low-stock alerts.
            </DialogDescription>
          </DialogHeader>
          <form
            id="product-form"
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Product name</Label>
                <Input id="name" {...form.register("name")} />
                <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...form.register("sku")} />
                <p className="text-xs text-destructive">{form.formState.errors.sku?.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={form.watch("categoryId")}
                  onValueChange={(v) => form.setValue("categoryId", v, { shouldValidate: true })}
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-destructive">
                  {form.formState.errors.categoryId?.message}
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="imageUrl">Product image URL</Label>
                <Input id="imageUrl" placeholder="https://..." {...form.register("imageUrl")} />
                <p className="text-xs text-destructive">
                  {form.formState.errors.imageUrl?.message}
                </p>
              </div>
              {numberField("buyingPrice", "Buying price", "0.01")}
              {numberField("sellingPrice", "Selling price", "0.01")}
              {numberField("stock", "Current stock")}
              {numberField("minStock", "Minimum stock")}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "product"}?`}
        description="This removes the product from your catalogue."
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </AppLayout>
  );
}
