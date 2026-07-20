"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Search } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import { createStartup, getStartup, type StartupPayload } from "@/lib/api/startups";
import { ApiError } from "@/lib/api/client";
import { addToRegistry, getRegistry } from "@/lib/local-registry";
import { CHECK_SIZES, GEOGRAPHIES, SECTORS, STAGES } from "@/lib/constants";

const REGISTRY_KEY = "startups";

const startupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sector: z.string().optional(),
  stage: z.string().optional(),
  geography: z.string().optional(),
  check_size: z.string().optional(),
});

type StartupValues = z.infer<typeof startupSchema>;

export default function StartupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ids, setIds] = useState<number[]>(() => (user ? getRegistry(REGISTRY_KEY, user.id) : []));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [looking, setLooking] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StartupValues>({ resolver: zodResolver(startupSchema) });

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["startup", id],
      queryFn: () => getStartup(id),
    })),
  });

  async function onCreate(values: StartupValues) {
    if (!user) return;
    try {
      const payload: StartupPayload = { ...values };
      const startup = await createStartup(payload);
      addToRegistry(REGISTRY_KEY, user.id, startup.id);
      setIds((prev) => [startup.id, ...prev.filter((id) => id !== startup.id)]);
      toast.success(`Startup "${startup.name}" created`);
      reset();
      setDialogOpen(false);
      router.push(`/dashboard/startups/${startup.id}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't create startup", { description: message });
    }
  }

  async function onLookup() {
    if (!user || !lookupId.trim()) return;
    const id = Number(lookupId);
    if (!Number.isInteger(id)) {
      toast.error("Enter a valid numeric ID");
      return;
    }
    setLooking(true);
    try {
      await getStartup(id);
      addToRegistry(REGISTRY_KEY, user.id, id);
      setIds((prev) => [id, ...prev.filter((existing) => existing !== id)]);
      setLookupId("");
      toast.success(`Opened startup #${id}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Startup not found", { description: message });
    } finally {
      setLooking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Startups</h1>
          <p className="text-muted-foreground">
            Manage your startup profiles used for pitches and investor matching.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New startup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a startup</DialogTitle>
              <DialogDescription>
                This profile is used to compute investor matches.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Acme Inc." {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Open by ID</CardTitle>
          <CardDescription>
            This API doesn&apos;t provide a list endpoint yet — startups you create or
            open are remembered on this device. Already know an ID? Open it here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Startup ID, e.g. 1"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="max-w-40"
            />
            <Button variant="outline" onClick={onLookup} disabled={looking} className="gap-2">
              {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Open
            </Button>
          </div>
        </CardContent>
      </Card>

      {ids.length === 0 ? (
        <EmptyState
          title="No startups yet"
          description="Create your first startup profile to start submitting pitches."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queries.map((query, index) => {
            const id = ids[index];
            if (query.isLoading) {
              return <Skeleton key={id} className="h-40 w-full" />;
            }
            if (query.isError || !query.data) {
              return (
                <ErrorState
                  key={id}
                  title={`Startup #${id} unavailable`}
                  className="py-8"
                />
              );
            }
            const startup = query.data;
            return (
              <Link key={id} href={`/dashboard/startups/${id}`}>
                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle className="text-base">{startup.name ?? `Startup #${id}`}</CardTitle>
                    <CardDescription>ID #{id}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {startup.sector && <Badge variant="secondary">{startup.sector}</Badge>}
                    {startup.stage && <Badge variant="outline">{startup.stage}</Badge>}
                    {startup.geography && <Badge variant="outline">{startup.geography}</Badge>}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
