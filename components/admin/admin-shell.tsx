"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { InitialsAvatar } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import "@/components/landing/fortuna.css";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badgeKey?: "pendingRequests" | "openSupport";
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Work",
    items: [
      {
        href: "/dashboard/admin",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/dashboard/admin/request-access",
        label: "Request access",
        icon: Inbox,
        badgeKey: "pendingRequests",
      },
      { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
      {
        href: "/dashboard/admin/support",
        label: "Support",
        icon: LifeBuoy,
        badgeKey: "openSupport",
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/dashboard/admin/content", label: "Content", icon: BookOpen },
      { href: "/dashboard/admin/billing", label: "Billing", icon: CreditCard },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/admin/audit", label: "Audit", icon: ClipboardList },
      { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const TITLE_BY_PATH: { match: (pathname: string) => boolean; title: string }[] =
  [
    { match: (p) => p === "/dashboard/admin", title: "Overview" },
    {
      match: (p) => p.startsWith("/dashboard/admin/request-access"),
      title: "Request access",
    },
    {
      match: (p) => /^\/dashboard\/admin\/clients\/[^/]+/.test(p),
      title: "Client",
    },
    {
      match: (p) => p.startsWith("/dashboard/admin/clients"),
      title: "Clients",
    },
    {
      match: (p) => p.startsWith("/dashboard/admin/support"),
      title: "Support",
    },
    {
      match: (p) => p.startsWith("/dashboard/admin/content"),
      title: "Content",
    },
    {
      match: (p) => p.startsWith("/dashboard/admin/billing"),
      title: "Billing",
    },
    { match: (p) => p.startsWith("/dashboard/admin/audit"), title: "Audit" },
    {
      match: (p) => p.startsWith("/dashboard/admin/settings"),
      title: "Settings",
    },
    {
      match: (p) => p.startsWith("/dashboard/admin/invite"),
      title: "Invite user",
    },
  ];

export function AdminShell({
  children,
  userEmail,
  pendingRequests = 0,
  openSupport = 0,
}: {
  children: React.ReactNode;
  userEmail: string;
  pendingRequests?: number;
  openSupport?: number;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const badges = { pendingRequests, openSupport };
  const pageTitle =
    TITLE_BY_PATH.find((t) => t.match(pathname))?.title ?? "Admin";

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f7f6f2] text-neutral-950">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-60 flex-col border-r border-black/[0.06] bg-white px-2.5 py-3 transition-transform lg:sticky lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between px-2">
          <Link href="/dashboard/admin">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={160}
              height={40}
              className="h-7 w-auto"
              unoptimized
            />
          </Link>
          <button
            type="button"
            className="p-2 text-neutral-500 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-4 overflow-y-auto"
          aria-label="Admin navigation"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ href, label, icon: Icon, exact, badgeKey }) => {
                  const active = exact
                    ? pathname === href
                    : pathname === href || pathname.startsWith(`${href}/`);
                  const count = badgeKey ? badges[badgeKey] : 0;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {count > 0 ? (
                        <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-2 border-t border-black/[0.06] px-1.5 pt-3">
          <div className="flex items-center gap-2 px-1">
            <InitialsAvatar name={userEmail} />
            <p
              className="min-w-0 truncate text-xs text-neutral-500"
              title={userEmail}
            >
              {userEmail}
            </p>
          </div>
          <LogoutButton variant="outline" size="sm" className="w-full" />
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-[#f7f6f2]/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] bg-white text-neutral-700 lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-neutral-900">
              {pageTitle}
            </p>
          </div>
          <p className="hidden truncate text-xs text-neutral-400 sm:block">
            {userEmail}
          </p>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
