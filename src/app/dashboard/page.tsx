"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Bell,
  Briefcase,
  CalendarCheck,
  FileText,
  Mail,
  Target,
  Users,
  Vault,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-provider";
import { getProfileCompleteness } from "@/lib/api/users";
import { getBadges, getReputation } from "@/lib/api/reputation";
import { listNotifications } from "@/lib/api/notifications";

const QUICK_LINKS = [
  { href: "/dashboard/startups", label: "Startups", icon: Briefcase },
  { href: "/dashboard/pitches", label: "Pitches", icon: FileText },
  { href: "/dashboard/matches", label: "Matching", icon: Target },
  { href: "/dashboard/mentors", label: "Mentors", icon: Users },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/deal-rooms", label: "Deal rooms", icon: Vault },
  { href: "/dashboard/messages", label: "Messages", icon: Mail },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const completenessQuery = useQuery({
    queryKey: ["profile-completeness", user?.id],
    queryFn: () => getProfileCompleteness(user!.id),
    enabled: !!user,
  });

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

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: listNotifications,
    enabled: !!user,
  });

  const unreadCount = notificationsQuery.data?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your StartPitch account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile completeness</CardTitle>
            <CardDescription>Fill out your profile to improve matching.</CardDescription>
          </CardHeader>
          <CardContent>
            {completenessQuery.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{completenessQuery.data?.score ?? 0}%</span>
                  <Link href="/dashboard/profile" className="text-primary hover:underline">
                    Edit profile
                  </Link>
                </div>
                <Progress value={completenessQuery.data?.score ?? 0} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reputation</CardTitle>
            <CardDescription>Your average rating from the community.</CardDescription>
          </CardHeader>
          <CardContent>
            {reputationQuery.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold">
                  {reputationQuery.data?.score.toFixed(1) ?? "0.0"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({reputationQuery.data?.ratings.length ?? 0} ratings)
                </span>
                {badgesQuery.data?.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="gap-1 capitalize">
                    <Award className="h-3 w-3" />
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Unread updates waiting for you.</CardDescription>
          </CardHeader>
          <CardContent>
            {notificationsQuery.isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">{unreadCount}</span>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/notifications">View all</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-medium">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="transition-colors hover:border-primary/50 hover:bg-accent/50">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <link.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm">{link.label}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
