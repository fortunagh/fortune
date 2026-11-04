"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Bell,
  BookOpen,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { fortunaUiClass } from "@/lib/fonts/fortuna";

const clientNav = [
  { href: "/dashboard", label: "Onboarding", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/dashboard/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function PortalShell({
  children,
  userEmail,
  firstName,
}: {
  children: React.ReactNode;
  userEmail: string;
  firstName?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-foreground">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(18rem,calc(100vw-1rem))] flex-col border-r border-border bg-card transition-transform duration-200 md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex min-h-14 items-center justify-between gap-2 border-b border-border px-4">
          <Link href="/dashboard" className="block min-w-0">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={180}
              height={46}
              className="h-8 w-auto dark:brightness-110"
              unoptimized
            />
          </Link>
          <button
            type="button"
            className="p-2 text-muted-foreground md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className={cn(fortunaUiClass, "flex flex-1 flex-col gap-0.5 overflow-y-auto p-2")}
          aria-label="Client navigation"
        >
          {clientNav.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-11 items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "border-l-2 border-primary bg-primary/10 text-foreground"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <p className={cn(fortunaUiClass, "mb-2 truncate text-xs text-muted-foreground")}>
            {firstName ? `${firstName} · ` : ""}
            {userEmail}
          </p>
          <LogoutButton variant="outline" size="sm" className="w-full rounded-none" />
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className={cn(fortunaUiClass, "truncate text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground")}>
              Client portal
            </p>
          </div>
          <ThemeSwitcher />
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
