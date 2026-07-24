"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { createMentor, listMentors } from "@/lib/api/mentors";
import { ApiError } from "@/lib/api/client";

const mentorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  expertise: z.string().min(1, "Enter at least one area of expertise"),
  availability: z.string().min(1, "Availability is required"),
});

type MentorValues = z.infer<typeof mentorSchema>;

export default function MentorsPage() {
  const [expertise, setExpertise] = useState("");
  const [availability, setAvailability] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ expertise: "", availability: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: mentors, isLoading, isError, refetch } = useQuery({
    queryKey: ["mentors", appliedFilters],
    queryFn: () =>
      listMentors({
        expertise: appliedFilters.expertise || undefined,
        availability: appliedFilters.availability || undefined,
      }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MentorValues>({ resolver: zodResolver(mentorSchema) });

  async function onCreate(values: MentorValues) {
    try {
      const mentor = await createMentor({
        name: values.name,
        expertise: values.expertise.split(",").map((e) => e.trim()).filter(Boolean),
        availability: values.availability,
      });
      toast.success(`Mentor "${mentor.name}" added`);
      reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't add mentor", { description: message });
    }
  }

  const addMentorDialog = (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add mentor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a mentor</DialogTitle>
          <DialogDescription>Create a mentor profile that founders can browse and book.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Jane Doe" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise</Label>
            <Input
              id="expertise"
              placeholder="fundraising, product, growth"
              {...register("expertise")}
            />
            <p className="text-xs text-muted-foreground">Comma-separated list.</p>
            {errors.expertise && (
              <p className="text-xs text-destructive">{errors.expertise.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Input id="availability" placeholder="weekdays" {...register("availability")} />
            {errors.availability && (
              <p className="text-xs text-destructive">{errors.availability.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Add mentor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mentors</h1>
          <p className="text-muted-foreground">Browse mentors and book a session.</p>
        </div>
        {addMentorDialog}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Expertise</label>
            <Input
              placeholder="e.g. fundraising"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Availability</label>
            <Input
              placeholder="e.g. weekdays"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-48"
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setAppliedFilters({ expertise, availability })}
          >
            <Search className="h-4 w-4" /> Filter
          </Button>
        </CardContent>
      </Card>

      {isLoading && <LoadingState label="Loading mentors..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {mentors && mentors.length === 0 && (
        <EmptyState
          title="No mentors match yet"
          description="Add a mentor profile using the button above to get started, or adjust your filters."
        />
      )}
      {mentors && mentors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <Link key={mentor.id} href={`/dashboard/mentors/${mentor.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-base">{mentor.name ?? `Mentor #${mentor.id}`}</CardTitle>
                  {mentor.availability && (
                    <CardDescription>{mentor.availability}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {mentor.expertise?.map((e) => (
                    <Badge key={e} variant="secondary">
                      {e}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
