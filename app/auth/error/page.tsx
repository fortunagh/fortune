import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
  authLinkClass,
} from "@/components/auth/auth-ui-classes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className={`text-sm leading-relaxed ${authCardDescriptionClass}`}>
          Code error: {params.error}
        </p>
      ) : (
        <p className={`text-sm leading-relaxed ${authCardDescriptionClass}`}>
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className={authCardClass}>
        <CardHeader>
          <CardTitle className={authCardTitleClass}>
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense>
            <ErrorContent searchParams={searchParams} />
          </Suspense>
          <Link href="/auth/login" className={authLinkClass}>
            Return to sign in →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
