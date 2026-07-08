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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAppDispatch } from "../../store/hooks";
import { createMember, updateMember } from "../../store/slices/membersSlice";
import type { User } from "../../types";

const baseSchema = {
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: z.enum(["Admin", "Member"]),
};

const createSchema = z.object({ ...baseSchema, password: z.string().min(4, "Min 4 characters") });
const editSchema = z.object({ ...baseSchema, password: z.string().min(4, "Min 4 characters").optional().or(z.literal("")) });

type MemberFormValues = z.infer<typeof editSchema>;

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: User | null;
}

function MemberFormDialog({ open, onOpenChange, member }: MemberFormDialogProps) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(member);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        full_name: member?.full_name ?? "",
        email: member?.email ?? "",
        role: member?.role ?? "Member",
        password: "",
      });
    }
  }, [open, member, reset]);

  const onSubmit = async (values: MemberFormValues) => {
    const payload = { ...values };
    if (isEdit && !payload.password) delete payload.password;

    const result =
      isEdit && member
        ? await dispatch(updateMember({ id: member.id, payload }))
        : await dispatch(createMember({ ...payload, password: payload.password ?? "" }));

    if (result.meta.requestStatus === "fulfilled") {
      toast.success(isEdit ? "Member updated" : "Member added");
      onOpenChange(false);
    } else {
      toast.error((result.payload as string) ?? (isEdit ? "Failed to update member" : "Failed to add member"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Member" : "Add Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={watch("role")} onValueChange={(value) => setValue("role", value as "Admin" | "Member")}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{isEdit ? "New Password" : "Password"}</Label>
              <Input id="password" type="password" placeholder={isEdit ? "Leave blank to keep" : ""} {...register("password")} />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MemberFormDialog;
