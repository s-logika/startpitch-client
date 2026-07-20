"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Loader2, Star } from "lucide-react";
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
import { LoadingState } from "@/components/common/state";
import { useAuth } from "@/lib/auth/auth-provider";
import { getBadges, getReputation, rateUser } from "@/lib/api/reputation";
import { ApiError } from "@/lib/api/client";

export default function ReputationPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rateUserId, setRateUserId] = useState("");
  const [rating, setRating] = useState("5");
  const [submitting, setSubmitting] = useState(false);

  const reputationQuery = useQuery({
    queryKey: ["reputation", user?.id],
    queryFn: () => getReputation(user!.id),
    enabled: !!user,
  });

  const badgesQuery = useQuery({
    queryKey: ["badges", user?.id],
    queryFn: () => getBadges(user!.id),
    enabled: !!user,
  });

  async function onRate() {
    const id = Number(rateUserId);
    const value = Number(rating);
    if (!Number.isInteger(id) || id <= 0) {
      toast.error("Enter a valid user ID");
      return;
    }
    if (!(value >= 1 && value <= 5)) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    setSubmitting(true);
    try {
      await rateUser(id, value);
      toast.success(`Rated user #${id}`);
      setRateUserId("");
      queryClient.invalidateQueries({ queryKey: ["reputation"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Something went wrong.";
      toast.error("Couldn't submit rating", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return <LoadingState />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reputation</h1>
        <p className="text-muted-foreground">Your standing in the StartPitch community.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your score</CardTitle>
            <CardDescription>Average of all ratings received.</CardDescription>
          </CardHeader>
          <CardContent>
            {reputationQuery.isLoading ? (
              <LoadingState />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-2xl font-semibold">
                  <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                  {reputationQuery.data?.score.toFixed(1) ?? "0.0"}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reputationQuery.data?.ratings.length ?? 0} ratings)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Badges</CardTitle>
            <CardDescription>Earned once your score reaches 4.0+.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {badgesQuery.data?.badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="gap-1 capitalize">
                <Award className="h-3 w-3" /> {badge}
              </Badge>
            )) ?? <span className="text-sm text-muted-foreground">No badges yet.</span>}
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Rate a user</CardTitle>
          <CardDescription>
            Leave a rating for a mentor, investor, or founder you&apos;ve worked with.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              className="w-32"
              value={rateUserId}
              onChange={(e) => setRateUserId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              type="number"
              min={1}
              max={5}
              className="w-24"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <Button onClick={onRate} disabled={submitting} className="gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
