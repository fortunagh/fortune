"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { FortunaHomepage } from "@/components/landing/fortuna-homepage";
import { RequestAccessDialog } from "@/components/landing/request-access-dialog";

/** Marketing site stays light regardless of portal theme preference. */
export function FortunaHome() {
  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, [setTheme]);

  return (
    <div className="light" data-marketing-light="">
      <FortunaHomepage onRequestAccess={() => setOpen(true)} />
      <RequestAccessDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
