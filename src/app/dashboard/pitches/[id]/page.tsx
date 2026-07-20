"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Plus, TrendingDown, TrendingUp } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { VersionCard } from "@/components/pitches/version-card";
import { addPitchVersion, getPitch, getScoreHistory, listPitchVersions } from "@/lib/api/pitches";
import { ApiError } from "@/lib/api/client";

interface VersionFormValues {
  content_url: string;
}

export default function PitchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pitchId = Number(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const pitchQuery = useQuery({ queryKey: ["pitch", pitchId], queryFn: () => getPitch(pitchId) });
  const versionsQuery = useQuery({
    queryKey: ["pitch-versions", pitchId],
    queryFn: () => listPitchVersions(pitchId),
  });
  const scoreHistoryQuery = useQuery({
    queryKey: ["score-history", pitchId],
    queryFn: () => getScoreHistory(pitchId),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<VersionFormValues>();

  async function onAddVersion(values: VersionFormValues) {
    try {
      await addPitchVersion(pitchId, values.content_url);
      toast.success("New version added");
      reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pitch-versions", pitchId] });
      queryClient.invalidateQueries({ queryKey: ["score-history", pitchId] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't add version", { description: message });
    }
  }

  if (pitchQuery.isLoading) return <LoadingState label="Loading pitch..." />;
  if (pitchQuery.isError || !pitchQuery.data) {
    return <ErrorState title="Pitch not found" onRetry={() => pitchQuery.refetch()} />;
  }

  const pitch = pitchQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 gap-1.5">
          <Link href="/dashboard/pitches">
            <ArrowLeft className="h-4 w-4" /> Back to pitches
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{pitch.title}</h1>
        <p className="text-muted-foreground">{pitch.summary}</p>
        <div className="mt-2 flex gap-2">
          <Badge variant="secondary">Startup #{pitch.startup_id}</Badge>
          {pitch.input_type && <Badge variant="outline">{pitch.input_type}</Badge>}
        </div>
      </div>

      {scoreHistoryQuery.data && scoreHistoryQuery.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score history</CardTitle>
            <CardDescription>Overall score across pitch versions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {scoreHistoryQuery.data.map((entry) => (
              <div
                key={entry.version_id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">v{entry.version_id}</span>
                <span className="font-medium">{entry.overall_score}</span>
                {entry.delta >= 0 ? (
                  <span className="flex items-center gap-0.5 text-emerald-600">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {entry.delta}
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-destructive">
                    <TrendingDown className="h-3.5 w-3.5" />
                    {entry.delta}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Versions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new pitch version</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddVersion)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content_url">Content URL</Label>
                <Input
                  id="content_url"
                  placeholder="https://storage.local/deck-v2.pdf"
                  {...register("content_url", { required: "Content URL is required" })}
                />
                {errors.content_url && (
                  <p className="text-xs text-destructive">{errors.content_url.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add version
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {versionsQuery.isLoading && <LoadingState label="Loading versions..." />}
      {versionsQuery.isError && <ErrorState onRetry={() => versionsQuery.refetch()} />}
      {versionsQuery.data && versionsQuery.data.length === 0 && (
        <EmptyState
          title="No versions yet"
          description="Add your first pitch version to run an AI evaluation."
        />
      )}
      <div className="flex flex-col gap-4">
        {versionsQuery.data?.map((version) => (
          <VersionCard key={version.id} version={version} />
        ))}
      </div>
    </div>
  );
}
