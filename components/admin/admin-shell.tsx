"use client";

import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import {
  Inbox,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

const nav = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/admin/request-access",
    label: "Request access",
    icon: Inbox,
  },
  { href: "/dashboard/admin/invite", label: "Invite user", icon: UserPlus },
];

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-svh w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      <aside
        className={cn(
          "flex flex-col border-r border-neutral-200 bg-white transition-[width] duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-1 border-b border-neutral-200 px-2 dark:border-neutral-800">
          <Link
            href="/"
            className={cn(
              "flex min-w-0 items-center justify-center",
              !collapsed && "flex-1 justify-start pl-1",
            )}
            title="Fortuna home"
          >
            <Image
              src="/logo.png"
              alt="Fortuna"
              width={120}
              height={40}
              className={cn(
                "h-8 w-auto object-contain",
                collapsed && "mx-auto h-7",
              )}
            />
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="shrink-0 rounded-md p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard/admin"
                ? pathname === "/dashboard/admin"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-amber-100/90 to-amber-50 text-amber-950 shadow-sm dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-50"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-2 dark:border-neutral-800">
          {!collapsed && (
            <p
              className="mb-2 truncate px-2 text-xs text-neutral-500 dark:text-neutral-400"
              title={userEmail || undefined}
            >
              {userEmail}
            </p>
          )}
          <LogoutButton
            variant="outline"
            size="sm"
            className={cn("w-full", collapsed && "px-2")}
          />
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Fortuna admin
          </p>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
