import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
  authLinkClass,
} from "@/components/auth/auth-ui-classes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Card className={authCardClass}>
        <CardHeader>
          <CardTitle className={authCardTitleClass}>Check your email</CardTitle>
          <CardDescription className={authCardDescriptionClass}>
            Confirm your email to complete access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className={`text-sm leading-relaxed ${authCardDescriptionClass}`}>
            You&apos;ve successfully signed up. Please check your email to
            confirm your account before signing in.
          </p>
          <Link href="/auth/login" className={authLinkClass}>
            Return to sign in →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
