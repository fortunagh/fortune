"use client";

import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
  authErrorTextClass,
  authFooterLineClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
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
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("password_set") === "1") {
      setInfo("Password saved. Sign in with your email and new password.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setInfo(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError("Enter your email to receive a magic link.");
      return;
    }
    const supabase = createClient();
    setMagicLoading(true);
    setError(null);
    setInfo(null);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      setInfo("Check your email for a sign-in link.");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Could not send link");
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className={authCardClass}>
        <CardHeader className="space-y-2 pb-2">
          <CardTitle className={authCardTitleClass}>Welcome back</CardTitle>
          <CardDescription className={authCardDescriptionClass}>
            Sign in to your Fortuna Global Holdings account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className={authLabelClass}>
                Email address
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(authInputClass, "pl-10")}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="password" className={authLabelClass}>
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className={cn(authLinkClass, "ml-auto text-xs")}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(authInputClass, "pl-10 pr-10")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {error && <p className={authErrorTextClass}>{error}</p>}
            {info && (
              <p className="text-sm text-emerald-700">{info}</p>
            )}
            <Button
              type="submit"
              variant="fortuna"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign In →"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs uppercase tracking-[0.14em] text-neutral-400">
              or
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-neutral-200 bg-white"
            disabled={magicLoading}
            onClick={handleMagicLink}
          >
            <Mail className="h-4 w-4" />
            {magicLoading ? "Sending…" : "Continue with Magic Link"}
          </Button>

          <p className={cn(authFooterLineClass, "mt-6")}>
            Don&apos;t have an account?{" "}
            <Link href="/" className={authLinkClass}>
              Request Access →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
