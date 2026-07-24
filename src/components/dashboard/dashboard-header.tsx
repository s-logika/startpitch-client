"use client";

import Link from "next/link";
import { LogOut, UserCog } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth/auth-provider";

function initialsFor(source: string): string {
  const parts = source.trim().split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const name = user?.profile?.name as string | undefined;
  const displayName = name || user?.email;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <span className="text-sm font-medium text-muted-foreground">
          {user ? `Welcome back, ${displayName}` : "Loading..."}
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {initialsFor(displayName ?? "")}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {name ? (
                  <>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs font-normal text-muted-foreground">{user.email}</div>
                  </>
                ) : (
                  user.email
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserCog />
                  Profile settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} variant="destructive">
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
