"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/state";
import { listMentors } from "@/lib/api/mentors";

export default function MentorsPage() {
  const [expertise, setExpertise] = useState("");
  const [availability, setAvailability] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ expertise: "", availability: "" });

  const { data: mentors, isLoading, isError, refetch } = useQuery({
    queryKey: ["mentors", appliedFilters],
    queryFn: () =>
      listMentors({
        expertise: appliedFilters.expertise || undefined,
        availability: appliedFilters.availability || undefined,
      }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mentors</h1>
        <p className="text-muted-foreground">Browse mentors and book a session.</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Expertise</label>
            <Input
              placeholder="e.g. fundraising"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Availability</label>
            <Input
              placeholder="e.g. weekdays"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-48"
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setAppliedFilters({ expertise, availability })}
          >
            <Search className="h-4 w-4" /> Filter
          </Button>
        </CardContent>
      </Card>

      {isLoading && <LoadingState label="Loading mentors..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {mentors && mentors.length === 0 && (
        <EmptyState
          title="No mentors available yet"
          description="The backend doesn't currently have a way to add mentors — this list will populate once mentor profiles are seeded server-side."
        />
      )}
      {mentors && mentors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <Link key={mentor.id} href={`/dashboard/mentors/${mentor.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/50">
                <CardHeader>
                  <CardTitle className="text-base">{mentor.name ?? `Mentor #${mentor.id}`}</CardTitle>
                  {mentor.availability && (
                    <CardDescription>{mentor.availability}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {mentor.expertise?.map((e) => (
                    <Badge key={e} variant="secondary">
                      {e}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
