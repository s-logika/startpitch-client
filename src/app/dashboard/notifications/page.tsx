"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { listNotifications, markNotificationRead } from "@/lib/api/notifications";
import { ApiError } from "@/lib/api/client";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
  });

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't mark as read", { description: message });
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Updates about matches, bookings, and messages.</p>
      </div>

      {isLoading && <LoadingState label="Loading notifications..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {notifications && notifications.length === 0 && (
        <EmptyState
          title="No notifications yet"
          description="You're all caught up. New notifications will show up here."
        />
      )}
      {notifications && notifications.length > 0 && (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm">{notification.message}</p>
                    {!notification.read && (
                      <Badge variant="secondary" className="mt-1">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    disabled={readMutation.isPending}
                    onClick={() => readMutation.mutate(notification.id)}
                  >
                    <Check className="h-3.5 w-3.5" /> Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
