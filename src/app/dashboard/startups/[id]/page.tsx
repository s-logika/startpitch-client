"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Target, Vault } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingState, ErrorState } from "@/components/common/state";
import { getStartup, updateStartup, type StartupPayload } from "@/lib/api/startups";
import { ApiError } from "@/lib/api/client";
import { CHECK_SIZES, GEOGRAPHIES, SECTORS, STAGES } from "@/lib/constants";

interface StartupFormValues {
  name: string;
  sector?: string;
  stage?: string;
  geography?: string;
  check_size?: string;
}

export default function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const startupId = Number(id);
  const queryClient = useQueryClient();

  const { data: startup, isLoading, isError, refetch } = useQuery({
    queryKey: ["startup", startupId],
    queryFn: () => getStartup(startupId),
  });

  const { register, handleSubmit, control, reset, formState: { isSubmitting } } =
    useForm<StartupFormValues>({ defaultValues: { name: "" } });

  useEffect(() => {
    if (startup) {
      reset({
        name: startup.name ?? "",
        sector: startup.sector,
        stage: startup.stage,
        geography: startup.geography,
        check_size: startup.check_size,
      });
    }
  }, [startup, reset]);

  const mutation = useMutation({
    mutationFn: (values: StartupFormValues) =>
      updateStartup(startupId, values as Partial<StartupPayload>),
    onSuccess: () => {
      toast.success("Startup updated");
      queryClient.invalidateQueries({ queryKey: ["startup", startupId] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Update failed", { description: message });
    },
  });

  if (isLoading) return <LoadingState label="Loading startup..." />;
  if (isError || !startup) {
    return <ErrorState title="Startup not found" onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 gap-1.5">
          <Link href="/dashboard/startups">
            <ArrowLeft className="h-4 w-4" /> Back to startups
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {startup.name ?? `Startup #${startupId}`}
        </h1>
        <p className="text-muted-foreground">Startup ID #{startupId}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Startup details</CardTitle>
            <CardDescription>Used by the matching algorithm against investor theses.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name", { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related</CardTitle>
            <CardDescription>Jump to pitches and matches for this startup.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link href={`/dashboard/pitches?startup_id=${startupId}`}>
                <Target className="h-4 w-4" /> Pitches for this startup
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link href={`/dashboard/matches?startup_id=${startupId}`}>
                <Target className="h-4 w-4" /> Matches for this startup
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-2">
              <Link href={`/dashboard/deal-rooms?startup_id=${startupId}`}>
                <Vault className="h-4 w-4" /> Open a deal room
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
