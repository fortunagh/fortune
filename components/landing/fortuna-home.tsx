"use client";

import { useState } from "react";

import { FortunaHomepage } from "@/components/landing/fortuna-homepage";
import { RequestAccessDialog } from "@/components/landing/request-access-dialog";

export function FortunaHome() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FortunaHomepage onRequestAccess={() => setOpen(true)} />
      <RequestAccessDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
