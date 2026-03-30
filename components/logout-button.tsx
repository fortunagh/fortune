"use client";

import { createClient } from "@/lib/supabase/client";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton({
  className,
  variant = "outline",
  size = "sm",
}: Pick<ButtonProps, "className" | "variant" | "size">) {
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
      size={size}
      className={className}
      onClick={logout}
    >
      Logout
    </Button>
  );
}
