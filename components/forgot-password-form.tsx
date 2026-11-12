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
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className={authCardClass}>
          <CardHeader>
            <CardTitle className={authCardTitleClass}>Check your email</CardTitle>
            <CardDescription className={authCardDescriptionClass}>
              Password reset instructions sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn("text-sm leading-relaxed", authCardDescriptionClass)}>
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={authCardClass}>
          <CardHeader>
            <CardTitle className={authCardTitleClass}>Reset password</CardTitle>
            <CardDescription className={authCardDescriptionClass}>
              We&apos;ll send a secure link to the address on file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
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
                {error && <p className={authErrorTextClass}>{error}</p>}
                <Button
                  type="submit"
                  variant="fortuna"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending…" : "Send reset link"}
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
      )}
    </div>
  );
}
