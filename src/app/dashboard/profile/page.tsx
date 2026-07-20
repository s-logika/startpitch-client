"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-provider";
import { updateMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";

const profileSchema = z.object({
  name: z.string().max(120).optional(),
  bio: z.string().max(500).optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", bio: "" },
  });

  useEffect(() => {
    if (user?.profile) {
      reset({
        name: (user.profile.name as string) ?? "",
        bio: (user.profile.bio as string) ?? "",
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileValues) => updateMe(values),
    onSuccess: async () => {
      toast.success("Profile updated");
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ["profile-completeness"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Update failed", { description: message });
    },
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account details.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            {user.email} <Badge variant="secondary" className="ml-2 capitalize">{user.role}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Ada Lovelace" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell investors and mentors a bit about yourself..."
                rows={4}
                {...register("bio")}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {(isSubmitting || mutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
