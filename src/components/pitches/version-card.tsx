"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  getEvaluationForVersion,
  getEvaluationJob,
  overrideEvaluation,
  queueEvaluation,
} from "@/lib/api/evaluations";
import { ApiError } from "@/lib/api/client";
import type { EvaluationJob, PitchVersion } from "@/types/api";

const SCORE_LABELS: Record<string, string> = {
  market: "Market",
  team: "Team",
  traction: "Traction",
  financials: "Financials",
  defensibility: "Defensibility",
  clarity: "Clarity",
};

export function VersionCard({ version }: { version: PitchVersion }) {
  const [jobId, setJobId] = useState<number | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overallInput, setOverallInput] = useState("");
  const [reasonInput, setReasonInput] = useState("");
  const queryClient = useQueryClient();

  const existingQuery = useQuery({
    queryKey: ["evaluation", version.id],
    queryFn: () => getEvaluationForVersion(version.id),
    retry: false,
    enabled: jobId === null,
  });

  const jobQuery = useQuery({
    queryKey: ["evaluation-job", jobId],
    queryFn: () => getEvaluationJob(jobId as number),
    enabled: jobId !== null,
    refetchInterval: (query) => (query.state.data?.status === "done" ? false : 1500),
  });

  const queueMutation = useMutation({
    mutationFn: () => queueEvaluation(version.id),
    onSuccess: (data) => {
      setJobId(data.id);
      toast.info("Evaluation queued", { description: "This usually takes a few seconds." });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't queue evaluation", { description: message });
    },
  });

  const overrideMutation = useMutation({
    mutationFn: (vars: { evaluationId: number; overall: number; reason: string }) =>
      overrideEvaluation(vars.evaluationId, vars.overall, vars.reason),
    onSuccess: () => {
      toast.success("Evaluation overridden");
      setOverrideOpen(false);
      queryClient.invalidateQueries({ queryKey: ["evaluation", version.id] });
      queryClient.invalidateQueries({ queryKey: ["evaluation-job", jobId] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Override failed", { description: message });
    },
  });

  const evaluation: EvaluationJob | undefined =
    jobQuery.data?.status === "done"
      ? jobQuery.data
      : existingQuery.data?.status === "done"
        ? existingQuery.data
        : undefined;

  const isProcessing =
    queueMutation.isPending || (jobId !== null && jobQuery.data?.status === "processing");

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Version #{version.id}</CardTitle>
          <CardDescription>
            Status: <span className="capitalize">{version.status}</span>
            {version.content_url && (
              <>
                {" "}
                &middot;{" "}
                <a
                  href={version.content_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  view deck
                </a>
              </>
            )}
          </CardDescription>
        </div>
        {!evaluation && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isProcessing}
            onClick={() => queueMutation.mutate()}
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Run AI evaluation
          </Button>
        )}
      </CardHeader>
      {(isProcessing || evaluation) && (
        <CardContent className="space-y-4">
          {isProcessing && !evaluation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Evaluating pitch...
            </div>
          )}
          {evaluation?.score && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold">
                  Overall score: {evaluation.score.overall}/100
                </span>
                {evaluation.override && (
                  <Badge variant="secondary">Overridden: {evaluation.override.overall}</Badge>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(SCORE_LABELS).map(([key, label]) => {
                  const value = evaluation.score?.[key as keyof typeof evaluation.score];
                  if (typeof value !== "number") return null;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <Progress value={value} />
                    </div>
                  );
                })}
              </div>
              {evaluation.feedback && (
                <div className="space-y-3">
                  <Separator />
                  {Object.entries(evaluation.feedback).map(([category, items]) => (
                    <div key={category}>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {category}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {items.map((item, i) => (
                          <li key={i} className="text-sm">
                            <span className="font-medium">{item.claim}</span>
                            {" — "}
                            <span className="text-muted-foreground">
                              {item.evidence_snippet_from_pitch}
                            </span>{" "}
                            <Badge
                              variant={item.verdict === "reasonable" ? "secondary" : "outline"}
                              className="ml-1 capitalize"
                            >
                              {item.verdict}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setOverallInput(String(evaluation.score?.overall ?? ""));
                    setOverrideOpen(true);
                  }}
                >
                  Override score
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Override evaluation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="overall">Overall score</Label>
                      <Input
                        id="overall"
                        type="number"
                        value={overallInput}
                        onChange={(e) => setOverallInput(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        rows={3}
                        value={reasonInput}
                        onChange={(e) => setReasonInput(e.target.value)}
                        placeholder="Reviewer adjusted after live Q&A"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      disabled={overrideMutation.isPending}
                      onClick={() =>
                        overrideMutation.mutate({
                          evaluationId: evaluation.id,
                          overall: Number(overallInput),
                          reason: reasonInput,
                        })
                      }
                    >
                      {overrideMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Save override
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
