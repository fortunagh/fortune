"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  Bell,
  BookOpen,
  Compass,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { InitialsAvatar, fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/steps", label: "My Journey", icon: Compass, matchPrefix: "/dashboard/steps" },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const mobileTabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/steps", label: "Journey", icon: Compass, matchPrefix: "/dashboard/steps" },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

const moreLinks = [
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(
  pathname: string,
  href: string,
  exact?: boolean,
  matchPrefix?: string,
) {
  if (exact) return pathname === href;
  if (matchPrefix) {
    return pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalShell({
  children,
  userEmail,
  firstName,
  pageTitle = "Dashboard",
}: {
  children: React.ReactNode;
  userEmail: string;
  firstName?: string | null;
  pageTitle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const displayName = firstName || userEmail.split("@")[0] || "Client";

  React.useEffect(() => {
    setMoreOpen(false);
    setMobileMenu(false);
  }, [pathname]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/dashboard/resources");
      return;
    }
    router.push(`/dashboard/resources?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f7f6f2] text-neutral-950">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-black/[0.06] bg-white px-3 py-4 lg:flex">
        <Link href="/dashboard" className="mb-8 px-2">
          <Image
            src="/fortuna/logo-header.png"
            alt="Fortuna Global Holdings"
            width={180}
            height={46}
            className="h-8 w-auto"
            unoptimized
          />
        </Link>

        <nav className={cn(fortunaUiClass, "flex flex-1 flex-col gap-1")} aria-label="Main">
          {mainNav.map((item) => {
            const active = isActive(
              pathname,
              item.href,
              item.exact,
              item.matchPrefix,
            );
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-black/[0.06] px-2 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-2 py-2">
            <InitialsAvatar name={displayName} />
            <div className="min-w-0 flex-1">
              <p className={cn(fortunaUiClass, "truncate text-sm font-semibold")}>
                {displayName}
              </p>
              <p className="truncate text-xs text-neutral-500">Client</p>
            </div>
          </div>
          <LogoutButton
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
          />
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/[0.06] bg-[#f7f6f2]/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                fortunaUiClass,
                "truncate text-lg font-semibold tracking-tight text-neutral-950",
              )}
            >
              {pageTitle}
            </p>
          </div>
          <form
            onSubmit={onSearch}
            className="relative hidden max-w-xs flex-1 md:block lg:max-w-sm"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources…"
              className="h-10 rounded-full border-neutral-200 bg-white pl-9 shadow-none"
            />
          </form>
          <Link
            href="/dashboard/notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-600 shadow-sm"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <Link href="/dashboard/profile" className="hidden sm:block">
            <InitialsAvatar name={displayName} />
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileMenu ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col bg-white p-4 shadow-xl lg:hidden">
            <div className="mb-6 flex items-center justify-between">
              <Image
                src="/fortuna/logo-header.png"
                alt=""
                width={160}
                height={40}
                className="h-7 w-auto"
                unoptimized
              />
              <button
                type="button"
                className="rounded-lg p-2"
                onClick={() => setMobileMenu(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-neutral-700"
                    onClick={() => setMobileMenu(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pt-4">
              <LogoutButton variant="outline" className="w-full rounded-xl" />
            </div>
          </div>
        </>
      ) : null}

      {/* iOS-style bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
        aria-label="Mobile"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
          {mobileTabs.map((item) => {
            const active = isActive(
              pathname,
              item.href,
              item.exact,
              item.matchPrefix,
            );
            const Icon = item.icon;
            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-semibold",
                    active ? "text-[#a8842a]" : "text-neutral-500",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl",
                      active && "bg-[hsl(var(--portal-gold-soft))]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              className={cn(
                "flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-semibold",
                moreOpen ? "text-[#a8842a]" : "text-neutral-500",
              )}
              onClick={() => setMoreOpen((v) => !v)}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl",
                  moreOpen && "bg-[hsl(var(--portal-gold-soft))]",
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-label="Close"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-20 z-50 rounded-3xl border border-black/[0.06] bg-white p-3 shadow-2xl lg:hidden">
            <ul className="grid grid-cols-2 gap-2">
              {moreLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-3 py-3 text-sm font-medium text-neutral-800"
                    >
                      <Icon className="h-4 w-4 text-[#a8842a]" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
