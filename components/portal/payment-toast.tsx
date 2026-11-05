"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { fortunaUiClass } from "@/components/portal/portal-ui";
import { cn } from "@/lib/utils";

export function PaymentToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paid = searchParams.get("paid") === "1";
  const cancelled = searchParams.get("cancelled") === "1";
  const [visible, setVisible] = useState(paid || cancelled);

  useEffect(() => {
    if (!paid && !cancelled) return;
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      router.replace("/dashboard");
    }, 2000);
    return () => window.clearTimeout(t);
  }, [paid, cancelled, router]);

  if (!visible || (!paid && !cancelled)) return null;

  return (
    <div
      role="status"
      className={cn(
        fortunaUiClass,
        "fixed left-1/2 top-4 z-[100] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-black/[0.06] px-4 py-3 text-center text-sm font-medium shadow-[0_12px_40px_rgba(16,18,23,0.12)]",
        paid
          ? "bg-emerald-50 text-emerald-950"
          : "bg-amber-50 text-amber-950",
      )}
    >
      {paid
        ? "Payment received. Updating your onboarding…"
        : "Checkout cancelled. You can try again anytime."}
    </div>
  );
}
