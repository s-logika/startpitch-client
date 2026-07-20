"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquarePlus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import { createBooking, listBookings, submitBookingFeedback, updateBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";
import type { Booking } from "@/types/api";

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];

interface CreateBookingValues {
  mentor_id: number;
}

interface FeedbackValues {
  rating: number;
  comment: string;
}

function FeedbackDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<FeedbackValues>({ defaultValues: { rating: 5, comment: "" } });

  async function onSubmit(values: FeedbackValues) {
    try {
      await submitBookingFeedback(booking.id, Number(values.rating), values.comment);
      toast.success("Feedback submitted");
      reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't submit feedback", { description: message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <MessageSquarePlus className="h-3.5 w-3.5" /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session feedback</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input id="rating" type="number" min={1} max={5} {...register("rating")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea id="comment" rows={3} {...register("comment")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, isError, refetch } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: () => listBookings({ user_id: user!.id }),
    enabled: !!user,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CreateBookingValues>();

  async function onCreate(values: CreateBookingValues) {
    if (!user) return;
    try {
      await createBooking({ mentor_id: Number(values.mentor_id), user_id: user.id });
      toast.success("Booking created");
      reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't create booking", { description: message });
    }
  }

  const statusMutation = useMutation({
    mutationFn: (vars: { id: number; status: string }) =>
      updateBooking(vars.id, { status: vars.status }),
    onSuccess: () => {
      toast.success("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Update failed", { description: message });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Your mentor session bookings.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New booking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book a mentor session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mentor_id">Mentor ID</Label>
                <Input
                  id="mentor_id"
                  type="number"
                  placeholder="1"
                  {...register("mentor_id", { required: "Mentor ID is required" })}
                />
                {errors.mentor_id && (
                  <p className="text-xs text-destructive">{errors.mentor_id.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Book
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <LoadingState label="Loading bookings..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {bookings && bookings.length === 0 && (
        <EmptyState
          title="No bookings yet"
          description="Book a session with a mentor to see it here."
        />
      )}
      {bookings && bookings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="text-base">Booking #{booking.id}</CardTitle>
                <CardDescription>
                  Mentor #{booking.mentor_id} &middot; User #{booking.user_id}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={booking.status ?? "pending"}
                    onValueChange={(status: string) =>
                      statusMutation.mutate({ id: booking.id, status })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {booking.feedback ? (
                  <Badge variant="secondary" className="w-fit">
                    Rated {booking.feedback.rating}/5
                  </Badge>
                ) : (
                  <FeedbackDialog booking={booking} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
