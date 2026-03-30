"use client";

import { AdminBrandMark, AdminSidebarBrand } from "@/components/admin/admin-brand";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/logout-button";
import {
  Inbox,
  LayoutDashboard,
  Menu,
  PanelLeft,
  PanelLeftClose,
  UserPlus,
  X,
} from "lucide-react";
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
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] flex-col border-r border-neutral-200 bg-white shadow-sm transition-[transform,width] duration-200 ease-out dark:border-neutral-800 dark:bg-neutral-900",
          "w-[min(18rem,calc(100vw-1rem))] max-w-[85vw] shrink-0",
          collapsed
            ? "md:w-[72px] md:min-w-[72px] md:max-w-[72px]"
            : "md:w-64 md:max-w-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:relative md:z-0 md:shadow-none",
        )}
      >
        <div className="flex min-h-[3.25rem] shrink-0 items-center justify-between gap-1 border-b border-neutral-200 px-2 py-2 pt-[max(0.35rem,env(safe-area-inset-top))] dark:border-neutral-800">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center overflow-hidden",
              collapsed && "justify-center",
            )}
          >
            <AdminSidebarBrand collapsed={collapsed} />
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              className="rounded-md p-2 text-neutral-600 hover:bg-neutral-100 md:hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-100 md:inline-flex dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <nav
          className="flex flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          aria-label="Admin navigation"
        >
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
                  "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-gradient-to-r from-amber-100/90 to-amber-50 text-amber-950 shadow-sm dark:from-amber-950/40 dark:to-amber-900/20 dark:text-amber-50"
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
                  collapsed && "justify-center px-2 md:justify-center",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-neutral-800">
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

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col md:min-h-svh">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95 md:px-6">
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <AdminBrandMark className="block h-5 w-5 shrink-0 text-neutral-500 md:hidden" />
            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold tracking-tight text-neutral-900 [text-shadow:0_0_1px_rgba(212,175,55,0.45)] dark:text-neutral-50 dark:[text-shadow:0_0_1px_rgba(212,175,55,0.35)]"
                title="Fortuna Global Holdings"
              >
                Fortuna Global Holdings
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400 md:hidden">
                {userEmail}
              </p>
              <p className="hidden truncate text-xs text-neutral-500 dark:text-neutral-400 md:block">
                Admin console
              </p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
