import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/common/page-header";
import { SearchBar } from "@/components/common/search-bar";
import { DataTable, type Column } from "@/components/common/data-table";
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
import { categoriesQuery, productsQuery } from "@/lib/queries";
import { createCategory, updateCategory, deleteCategory } from "@/lib/api/categories";
import type { Category } from "@/lib/mock/types";
import { requireAuth } from "@/lib/route-guards";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/categories")({
  ssr: false,
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Categories — SmartBiz ERP Lite" },
      { name: "description", content: "Organise your catalogue with product categories." },
      { property: "og:title", content: "Categories — SmartBiz ERP Lite" },
      { property: "og:description", content: "Create, edit and remove product categories." },
    ],
  }),
  component: CategoriesPage,
});

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().max(160, "Keep it under 160 characters"),
});
type FormValues = z.infer<typeof schema>;

function CategoriesPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const categories = useQuery(categoriesQuery);
  const products = useQuery(productsQuery);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["categories"] });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      editing ? updateCategory(editing.id, values) : createCategory(values),
    onSuccess: () => {
      invalidate();
      toast.success(editing ? "Category updated" : "Category created");
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Could not save category", {
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted");
      setDeleting(null);
    },
    onError: (error: Error) => {
      toast.error("Could not delete category", {
        description: error.message,
      });
    },
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (categories.data ?? []).filter(
      (c) =>
        !term ||
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term),
    );
  }, [categories.data, search]);

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: Category) => {
    setEditing(row);
    form.reset({ name: row.name, description: row.description });
    setDialogOpen(true);
  };

  const countFor = (id: string) => (products.data ?? []).filter((p) => p.categoryId === id).length;

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Category",
      cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (row) => <span className="text-muted-foreground">{row.description || "—"}</span>,
    },
    {
      key: "products",
      header: "Products",
      cell: (row) => (
        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{countFor(row.id)}</span>
      ),
    },
    { key: "created", header: "Created", cell: (row) => row.createdAt },
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

  return (
    <AppLayout>
      <PageHeader
        title="Categories"
        description="Group products so reporting and filtering stay tidy."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New category
          </Button>
        }
      />

      <SearchBar value={search} onChange={setSearch} placeholder="Search categories" />

      <DataTable
        columns={columns}
        rows={rows}
        isLoading={categories.isLoading}
        isError={categories.isError}
        onRetry={() => categories.refetch()}
        emptyState={
          <EmptyState
            icon={Tags}
            title="No categories found"
            description="Create your first category to start organising products."
            actionLabel="New category"
            onAction={openCreate}
          />
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Categories keep your catalogue searchable and reportable.
            </DialogDescription>
          </DialogHeader>
          <form
            id="category-form"
            className="space-y-4"
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register("name")} />
              <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...form.register("description")} />
              <p className="text-xs text-destructive">
                {form.formState.errors.description?.message}
              </p>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete ${deleting?.name ?? "category"}?`}
        description="Products in this category will keep their data but lose the grouping."
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
      />
    </AppLayout>
  );
}
