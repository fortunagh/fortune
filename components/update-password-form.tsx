"use client";

import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
  authErrorTextClass,
  authInputClass,
  authLabelClass,
} from "@/components/auth/auth-ui-classes";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Establish session from invite/recovery hash if present.
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.replace(/^#/, ""));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled) setReady(Boolean(data.session));
    })().catch(() => {
      if (!cancelled) setReady(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      if (password !== confirm) {
        throw new Error("Passwords do not match.");
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await fetch("/api/onboarding/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => null);

      // End the invite session so they sign in cleanly on the login page.
      await supabase.auth.signOut();
      router.replace("/auth/login?password_set=1");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className={authCardClass}>
        <CardHeader>
          <CardTitle className={authCardTitleClass}>Set your password</CardTitle>
          <CardDescription className={authCardDescriptionClass}>
            Choose a password for your Fortuna account. You will sign in on the
            next screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-neutral-600">
              Checking your invite link… If this stays blank, open the latest
              set-password email again (old links expire).
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="password" className={authLabelClass}>
                    New password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={authInputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" className={authLabelClass}>
                    Confirm password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={authInputClass}
                  />
                </div>
                {error && <p className={authErrorTextClass}>{error}</p>}
                <Button
                  type="submit"
                  variant="fortuna"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving…" : "Save password & continue"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
