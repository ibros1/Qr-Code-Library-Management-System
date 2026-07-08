import { useEffect, useState } from "react";
import { Pencil, Plus, ShieldAlert, Tag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import DataTable from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteCategory, fetchCategories } from "../../store/slices/categoriesSlice";
import { fetchBooks } from "../../store/slices/booksSlice";
import type { Category } from "../../types";
import CategoryFormDialog from "./CategoryFormDialog";

function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { items: categories, loading } = useAppSelector((state) => state.categories);
  const { items: books } = useAppSelector((state) => state.books);
  const { isAdmin } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchCategories());
      dispatch(fetchBooks());
    }
  }, [dispatch, isAdmin]);

  if (!isAdmin) {
    return (
      <EmptyState icon={ShieldAlert} title="Admins only" description="You don't have access to category management." />
    );
  }

  const openCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const bookCount = (categoryId: number) => books.filter((b) => b.category.id === categoryId).length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(deleteCategory(deleteTarget.id));
    setDeleting(false);

    if (deleteCategory.fulfilled.match(result)) {
      toast.success("Category deleted");
      setDeleteTarget(null);
    } else {
      toast.error((result.payload as string) ?? "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage the categories books can be assigned to</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            loading={loading}
            rows={categories}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={Tag}
                title="No categories yet"
                description="Add your first category so books can be classified."
                action={
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="size-4" />
                    Add Category
                  </Button>
                }
              />
            }
            columns={[
              { header: "Name", cell: (row) => <span className="font-medium text-foreground">{row.name}</span> },
              { header: "Books", cell: (row) => bookCount(row.id) },
              {
                header: "",
                className: "text-right",
                cell: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit category">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row)} title="Delete category">
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Categories used by books cannot be deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default CategoriesPage;
