import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function AdminTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-neutral-200/80 bg-white",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminTable({
  className,
  ...props
}: React.ComponentProps<typeof Table>) {
  return <Table className={cn("min-w-full", className)} {...props} />;
}

export function AdminTableHeader({
  className,
  ...props
}: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader
      className={cn("sticky top-0 z-10 bg-neutral-50/95 backdrop-blur", className)}
      {...props}
    />
  );
}

export function AdminTableHead({
  className,
  ...props
}: React.ComponentProps<typeof TableHead>) {
  return (
    <TableHead
      className={cn(
        "h-9 px-3 text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-500",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTableBody(props: React.ComponentProps<typeof TableBody>) {
  return <TableBody {...props} />;
}

export function AdminTableRow({
  className,
  clickable,
  ...props
}: React.ComponentProps<typeof TableRow> & { clickable?: boolean }) {
  return (
    <TableRow
      className={cn(
        "h-10 border-neutral-100",
        clickable && "cursor-pointer",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTableCell({
  className,
  ...props
}: React.ComponentProps<typeof TableCell>) {
  return (
    <TableCell
      className={cn("px-3 py-2 text-sm text-neutral-800", className)}
      {...props}
    />
  );
}

export function AdminTableEmpty({
  colSpan,
  children,
}: {
  colSpan: number;
  children: React.ReactNode;
}) {
  return (
    <AdminTableRow className="hover:bg-transparent">
      <AdminTableCell
        colSpan={colSpan}
        className="h-24 text-center text-sm text-neutral-500"
      >
        {children}
      </AdminTableCell>
    </AdminTableRow>
  );
}
