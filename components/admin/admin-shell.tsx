"use client";

import { AdminBrandMark, AdminSidebarBrand } from "@/components/admin/admin-brand";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";
import { fortunaUiClass } from "@/lib/fonts/fortuna";
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  Inbox,
  LayoutDashboard,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Shield,
  Users,
  UserPlus,
  LifeBuoy,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import "@/components/landing/fortuna.css";

const nav = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
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
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] w-full bg-background text-foreground">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-[100dvh] flex-col border-r border-border bg-card transition-[transform,width] duration-200",
          "w-[min(18rem,calc(100vw-1rem))] max-w-[85vw] shrink-0",
          collapsed
            ? "md:w-[72px] md:min-w-[72px] md:max-w-[72px]"
            : "md:w-64 md:max-w-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "md:relative md:z-0",
        )}
      >
        <div className="flex min-h-14 shrink-0 items-center justify-between gap-1 border-b border-border px-2 py-2">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center overflow-hidden",
              collapsed && "justify-center",
            )}
          >
            <AdminSidebarBrand collapsed={collapsed} />
          </div>
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
          className={cn(
            fortunaUiClass,
            "flex flex-1 flex-col gap-0.5 overflow-y-auto p-2",
          )}
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
                  "flex min-h-11 items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                  active
                    ? "border-l-2 border-primary bg-primary/10 text-foreground"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  collapsed && "justify-center px-2",
                )}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2">
          {!collapsed && (
            <p
              className={cn(
                fortunaUiClass,
                "mb-2 truncate px-2 text-xs text-muted-foreground",
              )}
              title={userEmail || undefined}
            >
              {userEmail}
            </p>
          )}
          <LogoutButton
            variant="outline"
            size="sm"
            iconOnly={collapsed}
            className={cn("w-full rounded-none", collapsed && "md:justify-center")}
          />
        </div>
      </aside>

      <div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground md:hidden"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden h-9 w-9 shrink-0 items-center justify-center border border-border text-foreground md:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <AdminBrandMark className="block h-5 w-5 shrink-0 text-muted-foreground md:hidden" />
            <div className="min-w-0">
              <p
                className={cn(
                  fortunaUiClass,
                  "truncate text-xs font-semibold uppercase tracking-[0.14em] text-foreground",
                )}
              >
                Fortuna admin
              </p>
              <p className="truncate text-xs text-muted-foreground md:hidden">
                {userEmail}
              </p>
            </div>
          </div>
          <Shield className="hidden h-4 w-4 text-primary sm:block" aria-hidden />
          <ThemeSwitcher />
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
