"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, Loader2, Plus, ShieldCheck } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import {
  addDocument,
  getAccessLogs,
  getDealRoom,
  getDocumentDownloadUrl,
  signNda,
} from "@/lib/api/deal-rooms";
import { ApiError } from "@/lib/api/client";

interface DocumentFormValues {
  name: string;
  url: string;
}

export default function DealRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const roomId = Number(id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const roomQuery = useQuery({ queryKey: ["deal-room", roomId], queryFn: () => getDealRoom(roomId) });
  const logsQuery = useQuery({
    queryKey: ["deal-room-logs", roomId],
    queryFn: () => getAccessLogs(roomId),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<DocumentFormValues>();

  const signMutation = useMutation({
    mutationFn: () => signNda(roomId),
    onSuccess: () => {
      toast.success("NDA signed");
      queryClient.invalidateQueries({ queryKey: ["deal-room", roomId] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't sign NDA", { description: message });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (docId: number) => getDocumentDownloadUrl(roomId, docId),
    onSuccess: (data) => {
      window.open(data.download_url, "_blank", "noopener,noreferrer");
      queryClient.invalidateQueries({ queryKey: ["deal-room-logs", roomId] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't get download link", { description: message });
    },
  });

  async function onAddDocument(values: DocumentFormValues) {
    try {
      await addDocument(roomId, values.name, values.url);
      toast.success("Document added");
      reset();
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["deal-room", roomId] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't add document", { description: message });
    }
  }

  if (roomQuery.isLoading) return <LoadingState label="Loading deal room..." />;
  if (roomQuery.isError || !roomQuery.data) {
    return <ErrorState title="Deal room not found" onRetry={() => roomQuery.refetch()} />;
  }

  const room = roomQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 gap-1.5">
          <Link href="/dashboard/deal-rooms">
            <ArrowLeft className="h-4 w-4" /> Back to deal rooms
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Deal room #{roomId}</h1>
        <p className="text-muted-foreground">Startup #{room.startup_id}</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Non-disclosure agreement</CardTitle>
            <CardDescription>
              {room.nda_signed
                ? "NDA has been signed for this deal room."
                : room.nda_required
                  ? "An NDA is required before documents can be shared."
                  : "No NDA required for this deal room."}
            </CardDescription>
          </div>
          <Badge variant={room.nda_signed ? "default" : "secondary"}>
            {room.nda_signed ? "Signed" : "Unsigned"}
          </Badge>
        </CardHeader>
        {!room.nda_signed && (
          <CardContent>
            <Button
              size="sm"
              className="gap-2"
              disabled={signMutation.isPending}
              onClick={() => signMutation.mutate()}
            >
              {signMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Sign NDA
            </Button>
          </CardContent>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Documents</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onAddDocument)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="deck.pdf"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="https://storage.local/deck.pdf"
                  {...register("url", { required: "URL is required" })}
                />
                {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {room.documents.length === 0 ? (
        <EmptyState title="No documents yet" description="Add a document to share it here." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {room.documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <CardTitle className="text-sm">{doc.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  disabled={downloadMutation.isPending}
                  onClick={() => downloadMutation.mutate(doc.id)}
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-medium">Access log</h2>
        {logsQuery.data && logsQuery.data.length === 0 && (
          <EmptyState title="No activity yet" description="Downloads will show up here." />
        )}
        {logsQuery.data && logsQuery.data.length > 0 && (
          <div className="flex flex-col gap-2">
            {logsQuery.data.map((log, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Badge variant="outline" className="capitalize">
                  {log.event}
                </Badge>
                {log.doc_id !== undefined && (
                  <span className="text-muted-foreground">Document #{log.doc_id}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
