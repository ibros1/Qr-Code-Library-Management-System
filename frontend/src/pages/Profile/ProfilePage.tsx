import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ImageUp, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../context/AuthContext";
import { useAppDispatch } from "../../store/hooks";
import { removeAvatar, updateMe, uploadAvatar } from "../../store/slices/authSlice";

const API_URL = import.meta.env.VITE_API_URL;

const profileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(4, "Min 4 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProfilePage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { full_name: user.full_name, email: user.email, password: "" } : undefined,
  });

  if (!user) return null;

  const avatarSrc = user.avatar_url ? `${API_URL}${user.avatar_url}` : undefined;

  const onSubmit = async (values: ProfileFormValues) => {
    const payload = { ...values };
    if (!payload.password) delete payload.password;

    const result = await dispatch(updateMe(payload));

    if (updateMe.fulfilled.match(result)) {
      toast.success("Profile updated");
      reset({ full_name: result.payload.full_name, email: result.payload.email, password: "" });
    } else {
      toast.error((result.payload as string) ?? "Failed to update profile");
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be smaller than 2MB");
      return;
    }

    setAvatarBusy(true);
    const result = await dispatch(uploadAvatar(file));
    setAvatarBusy(false);

    if (uploadAvatar.fulfilled.match(result)) {
      toast.success("Photo updated");
    } else {
      toast.error((result.payload as string) ?? "Failed to upload photo");
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarBusy(true);
    const result = await dispatch(removeAvatar());
    setAvatarBusy(false);

    if (removeAvatar.fulfilled.match(result)) {
      toast.success("Photo removed");
    } else {
      toast.error((result.payload as string) ?? "Failed to remove photo");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={avatarSrc} alt={user.full_name} />
            <AvatarFallback className="text-lg">{getInitials(user.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle>{user.full_name}</CardTitle>
            <CardDescription className="mt-1">
              <Badge variant={user.role === "Admin" ? "dark" : "neutral"}>{user.role}</Badge>
            </CardDescription>
            <div className="mt-3 flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={avatarBusy}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageUp className="size-4" />
                {avatarBusy ? "Uploading…" : "Change Photo"}
              </Button>
              {user.avatar_url && (
                <Button type="button" variant="ghost" size="sm" disabled={avatarBusy} onClick={handleRemovePhoto}>
                  <Trash2 className="size-4 text-destructive" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
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

            <div className="space-y-1.5">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" placeholder="Leave blank to keep current password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
