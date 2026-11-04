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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
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
          <CardTitle className={authCardTitleClass}>Create account</CardTitle>
          <CardDescription className={authCardDescriptionClass}>
            Prefer{" "}
            <Link href="/" className={authLinkClass}>
              Request Access
            </Link>{" "}
            for onboarding invitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className={authLabelClass}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className={authLabelClass}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authInputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className={authLabelClass}>
                  Confirm password
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
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
                {isLoading ? "Creating account…" : "Create account"}
              </Button>
            </div>
            <div className={cn("mt-5", authFooterLineClass)}>
              Already have an account?{" "}
              <Link href="/auth/login" className={authLinkClass}>
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
