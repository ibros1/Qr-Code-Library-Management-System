import { useEffect, useState } from "react";
import { BookOpen, Pencil, Plus, QrCode, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import DataTable from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteBook, fetchBooks } from "../../store/slices/booksSlice";
import type { Book } from "../../types";
import BookFormDialog from "./BookFormDialog";
import BookCopiesDialog from "./BookCopiesDialog";

function BooksPage() {
  const dispatch = useAppDispatch();
  const { items: books, loading } = useAppSelector((state) => state.books);
  const { isAdmin } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [copiesBook, setCopiesBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const openCreate = () => {
    setEditingBook(null);
    setFormOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await dispatch(deleteBook(deleteTarget.id));
    setDeleting(false);

    if (deleteBook.fulfilled.match(result)) {
      toast.success("Book deleted");
      setDeleteTarget(null);
    } else {
      toast.error((result.payload as string) ?? "Failed to delete book");
    }
  };

  // BookCopiesDialog reads the live book by id so it reflects newly generated copies.
  const copiesBookLive = copiesBook ? books.find((b) => b.id === copiesBook.id) ?? copiesBook : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Books</h1>
          <p className="text-sm text-muted-foreground">Manage the catalog and generate QR copies</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add Book
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            loading={loading}
            rows={books}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={BookOpen}
                title="No books yet"
                description="Add your first book to the catalog to get started."
                action={
                  isAdmin && (
                    <Button size="sm" onClick={openCreate}>
                      <Plus className="size-4" />
                      Add Book
                    </Button>
                  )
                }
              />
            }
            columns={[
              { header: "Title", cell: (row) => <span className="font-medium text-foreground">{row.title}</span> },
              { header: "Author", cell: (row) => row.author },
              { header: "ISBN", cell: (row) => <span className="font-mono text-xs">{row.isbn}</span> },
              { header: "Category", cell: (row) => row.category.name },
              { header: "Year", cell: (row) => row.published_year ?? "—" },
              {
                header: "Copies",
                cell: (row) => `${row.copies.filter((c) => c.status === "Available").length}/${row.copies.length} available`,
              },
              {
                header: "",
                className: "text-right",
                cell: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setCopiesBook(row)} title="View QR copies">
                      <QrCode className="size-4" />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit book">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete book"
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <BookFormDialog open={formOpen} onOpenChange={setFormOpen} book={editingBook} />
      <BookCopiesDialog open={Boolean(copiesBook)} onOpenChange={(open) => !open && setCopiesBook(null)} book={copiesBookLive} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title}"?`}
        description="This cannot be undone. Books with borrow history cannot be deleted."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default BooksPage;
