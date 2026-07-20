"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import { getMentor } from "@/lib/api/mentors";
import { createBooking } from "@/lib/api/bookings";
import { ApiError } from "@/lib/api/client";

export default function MentorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mentorId = Number(id);
  const { user } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState(false);

  const { data: mentor, isLoading, isError, refetch } = useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: () => getMentor(mentorId),
  });

  const bookMutation = useMutation({
    mutationFn: () => createBooking({ mentor_id: mentorId, user_id: user!.id }),
    onSuccess: () => {
      toast.success("Session booked");
      router.push("/dashboard/bookings");
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Booking failed", { description: message });
    },
    onSettled: () => setBooking(false),
  });

  if (isLoading) return <LoadingState label="Loading mentor..." />;
  if (isError || !mentor) {
    return <ErrorState title="Mentor not found" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 gap-1.5">
          <Link href="/dashboard/mentors">
            <ArrowLeft className="h-4 w-4" /> Back to mentors
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mentor.name ?? `Mentor #${mentorId}`}
        </h1>
        {mentor.availability && <p className="text-muted-foreground">{mentor.availability}</p>}
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Expertise</CardTitle>
          <CardDescription>Areas this mentor can help with.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {mentor.expertise?.map((e) => (
            <Badge key={e} variant="secondary">
              {e}
            </Badge>
          )) ?? <span className="text-sm text-muted-foreground">No expertise listed.</span>}
        </CardContent>
      </Card>

      <Button
        className="w-fit gap-2"
        disabled={booking}
        onClick={() => {
          setBooking(true);
          bookMutation.mutate();
        }}
      >
        {booking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CalendarCheck className="h-4 w-4" />
        )}
        Book a session
      </Button>
    </div>
  );
}
