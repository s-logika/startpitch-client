"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { createPitch, listPitches } from "@/lib/api/pitches";
import { ApiError } from "@/lib/api/client";

const pitchSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  startup_id: z.coerce.number().int().positive("Startup ID is required"),
  content_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

type PitchInput = z.input<typeof pitchSchema>;
type PitchValues = z.output<typeof pitchSchema>;

function PitchesContent() {
  const searchParams = useSearchParams();
  const startupIdParam = searchParams.get("startup_id");
  const startupId = startupIdParam ? Number(startupIdParam) : undefined;
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PitchInput, unknown, PitchValues>({
    resolver: zodResolver(pitchSchema),
    defaultValues: { startup_id: startupId },
  });

  const { data: pitches, isLoading, isError, refetch } = useQuery({
    queryKey: ["pitches", startupId ?? "all"],
    queryFn: () => listPitches(startupId ? { startup_id: startupId } : undefined),
  });

  async function onCreate(values: PitchValues) {
    try {
      const pitch = await createPitch({
        title: values.title,
        summary: values.summary,
        startup_id: values.startup_id,
        content_url: values.content_url || undefined,
      });
      toast.success(`Pitch "${pitch.title}" created`);
      reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pitches"] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't create pitch", { description: message });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pitches</h1>
          <p className="text-muted-foreground">
            {startupId
              ? `Pitches for startup #${startupId}`
              : "Submit and track pitch versions, scores, and evaluations."}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New pitch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a pitch</DialogTitle>
              <DialogDescription>
                You&apos;ll need the numeric ID of the startup this pitch belongs to.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startup_id">Startup ID</Label>
                <Input
                  id="startup_id"
                  type="number"
                  placeholder="1"
                  {...register("startup_id")}
                />
                {errors.startup_id && (
                  <p className="text-xs text-destructive">{errors.startup_id.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Acme Pitch" {...register("title")} />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea id="summary" rows={3} {...register("summary")} />
                {errors.summary && (
                  <p className="text-xs text-destructive">{errors.summary.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content_url">Content URL (optional)</Label>
                <Input
                  id="content_url"
                  placeholder="https://storage.local/deck.pdf"
                  {...register("content_url")}
                />
                {errors.content_url && (
                  <p className="text-xs text-destructive">{errors.content_url.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <LoadingState label="Loading pitches..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (!pitches || pitches.length === 0) && (
        <EmptyState
          title="No pitches yet"
          description="Create a pitch to start getting AI-assisted feedback."
        />
      )}

      {pitches && pitches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pitches.map((pitch) => (
            <Link key={pitch.id} href={`/dashboard/pitches/${pitch.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-base">{pitch.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{pitch.summary}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Startup #{pitch.startup_id}</Badge>
                  {pitch.input_type && <Badge variant="outline">{pitch.input_type}</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PitchesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PitchesContent />
    </Suspense>
  );
}
