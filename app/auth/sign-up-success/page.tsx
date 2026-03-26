import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
} from "@/components/auth/auth-ui-classes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <Card className={authCardClass}>
        <CardHeader>
          <CardTitle
            className={`${cinzel.className} text-2xl font-semibold tracking-wide ${authCardTitleClass}`}
          >
            Thank you
          </CardTitle>
          <CardDescription className={authCardDescriptionClass}>
            Confirm your email to complete access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-sm leading-relaxed ${authCardDescriptionClass}`}>
            You&apos;ve successfully signed up. Please check your email to
            confirm your account before signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
