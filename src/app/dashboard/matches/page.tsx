"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Target } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import {
  getThesis,
  matchesForInvestor,
  matchesForStartup,
  recomputeMatches,
  upsertThesis,
} from "@/lib/api/matching";
import { ApiError } from "@/lib/api/client";
import { CHECK_SIZES, GEOGRAPHIES, SECTORS, STAGES } from "@/lib/constants";
import type { FitMatch } from "@/types/api";

interface ThesisFormValues {
  sector?: string;
  stage?: string;
  geography?: string;
  check_size?: string;
}

function MatchList({ matches }: { matches: FitMatch[] }) {
  if (matches.length === 0) {
    return <EmptyState title="No matches yet" description="Try recomputing matches first." />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              Investor #{match.investor_id} &harr; Startup #{match.startup_id}
            </CardTitle>
            <Badge>{match.score} pts</Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Sector: {match.rationale.sector}</span>
            <span>&middot;</span>
            <span>Stage: {match.rationale.stage}</span>
            <span>&middot;</span>
            <span>Geo: {match.rationale.geography}</span>
            <span>&middot;</span>
            <span>Check size: {match.rationale.check_size}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MatchesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [investorId, setInvestorId] = useState(String(user?.id ?? ""));
  const [startupId, setStartupId] = useState(searchParams.get("startup_id") ?? "");
  const queryClient = useQueryClient();

  const thesisQuery = useQuery({
    queryKey: ["thesis", user?.id],
    queryFn: () => getThesis(user!.id),
    enabled: !!user,
    retry: false,
  });

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ThesisFormValues>({
    values: {
      sector: thesisQuery.data?.sector,
      stage: thesisQuery.data?.stage,
      geography: thesisQuery.data?.geography,
      check_size: thesisQuery.data?.check_size,
    },
  });

  async function onSaveThesis(values: ThesisFormValues) {
    if (!user) return;
    try {
      await upsertThesis({ investor_id: user.id, ...values });
      toast.success("Thesis saved");
      queryClient.invalidateQueries({ queryKey: ["thesis", user.id] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't save thesis", { description: message });
    }
  }

  const recomputeMutation = useMutation({
    mutationFn: recomputeMatches,
    onSuccess: () => {
      toast.success("Matches recomputed");
      queryClient.invalidateQueries({ queryKey: ["matches-for-investor"] });
      queryClient.invalidateQueries({ queryKey: ["matches-for-startup"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Recompute failed", { description: message });
    },
  });

  const investorMatchesQuery = useQuery({
    queryKey: ["matches-for-investor", investorId],
    queryFn: () => matchesForInvestor(Number(investorId)),
    enabled: investorId !== "" && !Number.isNaN(Number(investorId)),
  });

  const startupMatchesQuery = useQuery({
    queryKey: ["matches-for-startup", startupId],
    queryFn: () => matchesForStartup(Number(startupId)),
    enabled: startupId !== "" && !Number.isNaN(Number(startupId)),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matching</h1>
          <p className="text-muted-foreground">
            Set an investor thesis and see scored matches against startups.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          disabled={recomputeMutation.isPending}
          onClick={() => recomputeMutation.mutate()}
        >
          {recomputeMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Recompute all matches
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Your investor thesis</CardTitle>
          <CardDescription>
            Scored 40 pts sector, 30 pts stage, 15 pts geography, 15 pts check size against
            every startup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSaveThesis)} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sector</Label>
              <Controller
                control={control}
                name="sector"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Controller
                control={control}
                name="stage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Geography</Label>
              <Controller
                control={control}
                name="geography"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {GEOGRAPHIES.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Check size</Label>
              <Controller
                control={control}
                name="check_size"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHECK_SIZES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="col-span-2">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <Target className="h-4 w-4" />
                Save thesis
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="investor">
        <TabsList>
          <TabsTrigger value="investor">Matches for an investor</TabsTrigger>
          <TabsTrigger value="startup">Matches for a startup</TabsTrigger>
        </TabsList>
        <TabsContent value="investor" className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label htmlFor="investor-id">Investor ID</Label>
              <Input
                id="investor-id"
                className="w-40"
                value={investorId}
                onChange={(e) => setInvestorId(e.target.value)}
              />
            </div>
          </div>
          {investorMatchesQuery.isLoading && <LoadingState />}
          {investorMatchesQuery.isError && (
            <ErrorState onRetry={() => investorMatchesQuery.refetch()} />
          )}
          {investorMatchesQuery.data && <MatchList matches={investorMatchesQuery.data} />}
        </TabsContent>
        <TabsContent value="startup" className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label htmlFor="startup-id">Startup ID</Label>
              <Input
                id="startup-id"
                className="w-40"
                value={startupId}
                onChange={(e) => setStartupId(e.target.value)}
              />
            </div>
          </div>
          {startupMatchesQuery.isLoading && <LoadingState />}
          {startupMatchesQuery.isError && (
            <ErrorState onRetry={() => startupMatchesQuery.refetch()} />
          )}
          {startupMatchesQuery.data && <MatchList matches={startupMatchesQuery.data} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MatchesContent />
    </Suspense>
  );
}
