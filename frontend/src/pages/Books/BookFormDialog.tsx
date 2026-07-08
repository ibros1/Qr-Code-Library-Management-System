import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { createBook, updateBook } from "../../store/slices/booksSlice";
import { fetchCategories } from "../../store/slices/categoriesSlice";
import type { Book } from "../../types";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().min(1, "ISBN is required"),
  category_id: z.string().min(1, "Category is required"),
  published_year: z
    .string()
    .optional()
    .refine((val) => !val || (/^\d+$/.test(val) && Number(val) >= 1000 && Number(val) <= 2100), {
      message: "Enter a valid year",
    }),
});

type BookFormValues = z.infer<typeof bookSchema>;

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | null;
}

function BookFormDialog({ open, onOpenChange, book }: BookFormDialogProps) {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((state) => state.categories);
  const { isAdmin } = useAppSelector((state) => ({ isAdmin: state.auth.user?.role === "Admin" }));
  const isEdit = Boolean(book);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
  });

  useEffect(() => {
    if (open) dispatch(fetchCategories());
  }, [open, dispatch]);

  useEffect(() => {
    if (open) {
      reset({
        title: book?.title ?? "",
        author: book?.author ?? "",
        isbn: book?.isbn ?? "",
        category_id: book?.category ? String(book.category.id) : "",
        published_year: book?.published_year ? String(book.published_year) : "",
      });
    }
  }, [open, book, reset]);

  const onSubmit = async (values: BookFormValues) => {
    const payload = {
      title: values.title,
      author: values.author,
      isbn: values.isbn,
      category_id: Number(values.category_id),
      published_year: values.published_year ? Number(values.published_year) : undefined,
    };
    const result =
      isEdit && book ? await dispatch(updateBook({ id: book.id, payload })) : await dispatch(createBook(payload));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isEdit ? "Book updated" : "Book added");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) ?? (isEdit ? "Failed to update book" : "Failed to add book"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Book" : "Add Book"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="author">Author</Label>
            <Input id="author" {...register("author")} />
            {errors.author && <p className="text-xs text-red-600">{errors.author.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" {...register("isbn")} />
              {errors.isbn && <p className="text-xs text-red-600">{errors.isbn.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="published_year">Published Year</Label>
              <Input id="published_year" type="number" {...register("published_year")} />
              {errors.published_year && <p className="text-xs text-red-600">{errors.published_year.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category_id">Category</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No categories yet.{" "}
                {isAdmin && (
                  <Link to="/categories" className="text-primary underline" onClick={() => onOpenChange(false)}>
                    Add one first
                  </Link>
                )}
              </p>
            ) : (
              <Select value={watch("category_id")} onValueChange={(value) => setValue("category_id", value)}>
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.category_id && <p className="text-xs text-red-600">{errors.category_id.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || categories.length === 0}>
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BookFormDialog;
