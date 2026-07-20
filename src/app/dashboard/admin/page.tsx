"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import { approveVerification, flagContent, getAuditLogs, getPendingVerifications } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

export default function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [approveId, setApproveId] = useState("");
  const [flagId, setFlagId] = useState("");

  const isAdmin = user?.role === "admin";

  const verificationsQuery = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: getPendingVerifications,
    enabled: isAdmin,
  });

  const auditLogsQuery = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: getAuditLogs,
    enabled: isAdmin,
  });

  const approveMutation = useMutation({
    mutationFn: (userId: number) => approveVerification(userId),
    onSuccess: (data) => {
      toast.success(`Approved user #${data.user_id}`);
      setApproveId("");
      queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't approve", { description: message });
    },
  });

  const flagMutation = useMutation({
    mutationFn: (contentId: number) => flagContent(contentId),
    onSuccess: (data) => {
      toast.success(`Flagged content #${data.content_id}`);
      setFlagId("");
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't flag content", { description: message });
    },
  });

  if (!isAdmin) {
    return (
      <EmptyState
        title="Admins only"
        description="This section is restricted to accounts with the admin role."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground">Verifications, moderation, and audit logs.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Approve a verification</CardTitle>
            <CardDescription>Approve a pending user verification by user ID.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <Input
              placeholder="User ID"
              value={approveId}
              onChange={(e) => setApproveId(e.target.value)}
              className="w-32"
            />
            <Button
              className="gap-2"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate(Number(approveId))}
            >
              {approveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Approve
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Flag content</CardTitle>
            <CardDescription>Flag a piece of content for moderation by ID.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <Input
              placeholder="Content ID"
              value={flagId}
              onChange={(e) => setFlagId(e.target.value)}
              className="w-32"
            />
            <Button
              variant="destructive"
              className="gap-2"
              disabled={flagMutation.isPending}
              onClick={() => flagMutation.mutate(Number(flagId))}
            >
              {flagMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flag className="h-4 w-4" />
              )}
              Flag
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Pending verifications</h2>
        {verificationsQuery.isLoading && <LoadingState />}
        {verificationsQuery.isError && <ErrorState onRetry={() => verificationsQuery.refetch()} />}
        {verificationsQuery.data && verificationsQuery.data.length === 0 && (
          <EmptyState title="Nothing pending" description="No verifications waiting for review." />
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-medium">
          <ShieldAlert className="h-4 w-4" /> Audit log
        </h2>
        {auditLogsQuery.isLoading && <LoadingState />}
        {auditLogsQuery.isError && <ErrorState onRetry={() => auditLogsQuery.refetch()} />}
        {auditLogsQuery.data && auditLogsQuery.data.length === 0 && (
          <EmptyState title="No audit events yet" />
        )}
        {auditLogsQuery.data && auditLogsQuery.data.length > 0 && (
          <div className="flex flex-col gap-2">
            {auditLogsQuery.data.map((log, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <Badge variant="outline" className="capitalize">
                  {log.event}
                </Badge>
                <span className="text-muted-foreground">
                  {Object.entries(log)
                    .filter(([key]) => key !== "event")
                    .map(([key, value]) => `${key}: ${String(value)}`)
                    .join(", ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
