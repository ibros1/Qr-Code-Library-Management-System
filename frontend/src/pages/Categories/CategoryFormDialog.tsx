import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useAppDispatch } from "../../store/hooks";
import { createCategory, updateCategory } from "../../store/slices/categoriesSlice";
import type { Category } from "../../types";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (open) reset({ name: category?.name ?? "" });
  }, [open, category, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    const result =
      isEdit && category
        ? await dispatch(updateCategory({ id: category.id, payload: values }))
        : await dispatch(createCategory(values));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isEdit ? "Category updated" : "Category added");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) ?? (isEdit ? "Failed to update category" : "Failed to add category"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryFormDialog;
