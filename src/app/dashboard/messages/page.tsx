"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import { listMessages, sendMessage } from "@/lib/api/messages";
import { ApiError } from "@/lib/api/client";

interface SendMessageValues {
  to: number;
  body: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [threadWith, setThreadWith] = useState("");
  const queryClient = useQueryClient();

  const { data: messages, isLoading, isError, refetch } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: () => listMessages({ thread_with: user!.id }),
    enabled: !!user,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<SendMessageValues>();

  async function onSend(values: SendMessageValues) {
    if (!user) return;
    try {
      await sendMessage({ to: Number(values.to), from: user.id, body: values.body });
      toast.success("Message sent");
      reset({ to: values.to, body: "" });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't send message", { description: message });
    }
  }

  const filtered = threadWith
    ? messages?.filter(
        (m) => String(m.to) === threadWith || String(m.from) === threadWith
      )
    : messages;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Messages involving your account (user #{user?.id}).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
            <CardDescription>Filter by the other user&apos;s ID.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Filter by user ID (optional)"
              value={threadWith}
              onChange={(e) => setThreadWith(e.target.value)}
              className="max-w-56"
            />

            {isLoading && <LoadingState label="Loading messages..." />}
            {isError && <ErrorState onRetry={() => refetch()} />}
            {filtered && filtered.length === 0 && (
              <EmptyState title="No messages yet" description="Send a message to get started." />
            )}
            {filtered && filtered.length > 0 && (
              <div className="flex flex-col gap-2">
                {filtered.map((message) => {
                  const mine = message.from === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[80%] rounded-lg border px-3 py-2 text-sm ${
                        mine ? "self-end bg-primary text-primary-foreground" : "self-start bg-muted"
                      }`}
                    >
                      <p className="mb-0.5 text-xs opacity-70">
                        #{message.from} &rarr; #{message.to}
                      </p>
                      {message.body}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSend)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">To (user ID)</Label>
                <Input
                  id="to"
                  type="number"
                  placeholder="2"
                  {...register("to", { required: "Recipient is required" })}
                  onChange={(e) => {
                    setValue("to", Number(e.target.value));
                    setThreadWith(e.target.value);
                  }}
                />
                {errors.to && <p className="text-xs text-destructive">{errors.to.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea id="body" rows={4} {...register("body", { required: "Message is required" })} />
                {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
