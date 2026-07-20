"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  Briefcase,
  CalendarCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Shield,
  Target,
  Users,
  Vault,
  UserCog,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth/auth-provider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: null },
  { href: "/dashboard/startups", label: "Startups", icon: Briefcase, roles: null },
  { href: "/dashboard/pitches", label: "Pitches", icon: FileText, roles: null },
  { href: "/dashboard/matches", label: "Matching", icon: Target, roles: null },
  { href: "/dashboard/mentors", label: "Mentors", icon: Users, roles: null },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck, roles: null },
  { href: "/dashboard/deal-rooms", label: "Deal rooms", icon: Vault, roles: null },
  { href: "/dashboard/messages", label: "Messages", icon: Mail, roles: null },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, roles: null },
  { href: "/dashboard/reputation", label: "Reputation", icon: Award, roles: null },
  { href: "/dashboard/admin", label: "Admin", icon: Shield, roles: ["admin"] },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (item.roles as readonly string[]).includes(user?.role ?? "")
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <Image
                  src="/logofavicon.png"
                  alt="StartPitch"
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0"
                />
                <span className="text-base font-semibold">
                  <span className="text-brand-blue">Start</span>
                  <span className="text-brand-green">Pitch</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
              <Link href="/dashboard/profile">
                <UserCog />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
