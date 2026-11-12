"use client";

import { UserPlus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { InviteUserForm } from "@/components/admin/invite-user-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteUserDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get("invite") === "1") setOpen(true);
  }, [searchParams]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && searchParams.get("invite") === "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("invite");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="fortuna" size="sm">
          <UserPlus className="size-3.5" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>
        <InviteUserForm compact onSuccess={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
