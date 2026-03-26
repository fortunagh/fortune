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
import { Cinzel } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

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
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
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
            <CardTitle
              className={`${cinzel.className} text-2xl font-semibold tracking-wide ${authCardTitleClass}`}
            >
              Check your email
            </CardTitle>
            <CardDescription className={authCardDescriptionClass}>
              Password reset instructions sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-sm leading-relaxed ${authCardDescriptionClass}`}>
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className={authCardClass}>
          <CardHeader>
            <CardTitle
              className={`${cinzel.className} text-2xl font-semibold tracking-wide ${authCardTitleClass}`}
            >
              Reset password
            </CardTitle>
            <CardDescription className={authCardDescriptionClass}>
              We&apos;ll send a secure link to the address on file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
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
                {error && <p className={authErrorTextClass}>{error}</p>}
                <Button
                  type="submit"
                  variant="fortuna"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending…" : "Send reset link"}
                </Button>
              </div>
              <div className={`mt-4 ${authFooterLineClass}`}>
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
