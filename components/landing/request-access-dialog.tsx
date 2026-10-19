"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  RequestAccessFormPanel,
  requestAccessButtonClass,
} from "@/components/landing/request-access-form";
import { cn } from "@/lib/utils";

export { requestAccessButtonClass };

type RequestAccessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Controlled dialog for the existing request-access multi-step form. */
export function RequestAccessDialog({
  open,
  onOpenChange,
}: RequestAccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(94dvh,860px)] w-[calc(100%-1.25rem)] max-w-2xl overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Request access</DialogTitle>
        <RequestAccessFormPanel
          key={open ? "open" : "closed"}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

type RequestAccessButtonProps = {
  className?: string;
  ringOffsetClassName?: string;
};

export function RequestAccessButton({
  className,
  ringOffsetClassName,
}: RequestAccessButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            requestAccessButtonClass,
            ringOffsetClassName,
            className,
          )}
        >
          Request Access <span aria-hidden="true">⟶</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[min(94dvh,860px)] w-[calc(100%-1.25rem)] max-w-2xl overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Request access</DialogTitle>
        <RequestAccessFormPanel
          key={open ? "open" : "closed"}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
