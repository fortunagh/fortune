"use client";

import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton({
  className,
  variant = "outline",
  size = "sm",
  iconOnly = false,
}: Pick<ButtonProps, "className" | "variant" | "size"> & {
  /** When true, shows only a log-out icon (e.g. narrow admin sidebar). */
  iconOnly?: boolean;
}) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : size}
      className={className}
      onClick={logout}
      aria-label={iconOnly ? "Log out" : undefined}
    >
      {iconOnly ? <LogOut className="h-4 w-4" aria-hidden /> : "Logout"}
    </Button>
  );
}
