"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Loader2, Plus, Search, Vault } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-provider";
import { createDealRoom, getDealRoom } from "@/lib/api/deal-rooms";
import { ApiError } from "@/lib/api/client";
import { addToRegistry, getRegistry } from "@/lib/local-registry";

const REGISTRY_KEY = "deal-rooms";

interface CreateRoomValues {
  startup_id: number;
  nda_required: boolean;
}

function DealRoomsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const prefilledStartupId = searchParams.get("startup_id");
  const [ids, setIds] = useState<number[]>(() => (user ? getRegistry(REGISTRY_KEY, user.id) : []));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lookupId, setLookupId] = useState("");
  const [looking, setLooking] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } =
    useForm<CreateRoomValues>({
      defaultValues: {
        startup_id: prefilledStartupId ? Number(prefilledStartupId) : undefined,
        nda_required: true,
      },
    });

  const queries = useQueries({
    queries: ids.map((id) => ({ queryKey: ["deal-room", id], queryFn: () => getDealRoom(id) })),
  });

  async function onCreate(values: CreateRoomValues) {
    if (!user) return;
    try {
      const room = await createDealRoom({
        startup_id: Number(values.startup_id),
        nda_required: values.nda_required,
      });
      addToRegistry(REGISTRY_KEY, user.id, room.id);
      setIds((prev) => [room.id, ...prev.filter((id) => id !== room.id)]);
      toast.success("Deal room created");
      reset();
      setDialogOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't create deal room", { description: message });
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
      await getDealRoom(id);
      addToRegistry(REGISTRY_KEY, user.id, id);
      setIds((prev) => [id, ...prev.filter((existing) => existing !== id)]);
      setLookupId("");
      toast.success(`Opened deal room #${id}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Deal room not found", { description: message });
    } finally {
      setLooking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deal rooms</h1>
          <p className="text-muted-foreground">
            Share documents securely behind an NDA, with a full access log.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New deal room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a deal room</DialogTitle>
              <DialogDescription>Tie this deal room to a startup ID.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startup_id">Startup ID</Label>
                <Input
                  id="startup_id"
                  type="number"
                  placeholder="1"
                  {...register("startup_id", { required: "Startup ID is required" })}
                />
                {errors.startup_id && (
                  <p className="text-xs text-destructive">{errors.startup_id.message}</p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="nda_required">Require NDA</Label>
                <Controller
                  control={control}
                  name="nda_required"
                  render={({ field }) => (
                    <Switch
                      id="nda_required"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
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
            This API doesn&apos;t provide a list endpoint yet — deal rooms you create or
            open are remembered on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Deal room ID, e.g. 1"
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
          title="No deal rooms yet"
          description="Create a deal room to start sharing documents securely."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {queries.map((query, index) => {
            const id = ids[index];
            if (query.isLoading) return <Skeleton key={id} className="h-32 w-full" />;
            if (query.isError || !query.data) {
              return <ErrorState key={id} title={`Deal room #${id} unavailable`} className="py-8" />;
            }
            const room = query.data;
            return (
              <Link key={id} href={`/dashboard/deal-rooms/${id}`}>
                <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50">
                  <CardHeader className="flex-row items-center gap-3 space-y-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Vault className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Deal room #{id}</CardTitle>
                      <CardDescription>Startup #{room.startup_id}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Badge variant={room.nda_signed ? "default" : "secondary"}>
                      {room.nda_signed ? "NDA signed" : room.nda_required ? "NDA required" : "No NDA"}
                    </Badge>
                    <Badge variant="outline">{room.documents.length} documents</Badge>
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

export default function DealRoomsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DealRoomsContent />
    </Suspense>
  );
}
