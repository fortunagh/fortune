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
  Shield,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { InitialsAvatar, fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";
import "@/components/landing/fortuna.css";

const nav = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  {
    href: "/dashboard/admin/request-access",
    label: "Request access",
    icon: Inbox,
  },
  { href: "/dashboard/admin/clients", label: "Clients", icon: Users },
  { href: "/dashboard/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/admin/content", label: "Content", icon: BookOpen },
  { href: "/dashboard/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/admin/audit", label: "Audit", icon: ClipboardList },
  { href: "/dashboard/admin/invite", label: "Invite user", icon: UserPlus },
];

export function AdminShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

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
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-64 flex-col border-r border-black/[0.06] bg-white px-3 py-4 transition-transform lg:sticky lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <Link href="/dashboard/admin">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={180}
              height={46}
              className="h-8 w-auto"
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

        <p
          className={cn(
            fortunaUiClass,
            "mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400",
          )}
        >
          Admin
        </p>

        <nav
          className={cn(fortunaUiClass, "flex flex-1 flex-col gap-1")}
          aria-label="Admin navigation"
        >
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[hsl(var(--portal-gold-soft))] text-[#8a6d1f]"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-black/[0.06] px-2 pt-4">
          <div className="flex items-center gap-2">
            <InitialsAvatar name={userEmail} />
            <p className="min-w-0 truncate text-xs text-neutral-500" title={userEmail}>
              {userEmail}
            </p>
          </div>
          <LogoutButton
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
          />
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-black/[0.06] bg-[#f7f6f2]/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-neutral-700 lg:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                fortunaUiClass,
                "flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500",
              )}
            >
              <Shield className="h-3.5 w-3.5 text-[#c59d3f]" aria-hidden />
              Fortuna admin
            </p>
            <p className="truncate text-xs text-neutral-400 lg:hidden">
              {userEmail}
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
