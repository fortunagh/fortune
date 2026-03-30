"use client";

import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
  authErrorTextClass,
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
import { Cinzel } from "next/font/google";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
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
          <CardTitle
            className={`${cinzel.className} text-2xl font-semibold tracking-wide ${authCardTitleClass}`}
          >
            Sign in
          </CardTitle>
          <CardDescription className={authCardDescriptionClass}>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className={authLabelClass}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authInputClass}
                />
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
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authInputClass}
                />
              </div>
              {error && <p className={authErrorTextClass}>{error}</p>}
              <Button
                type="submit"
                variant="fortuna"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
