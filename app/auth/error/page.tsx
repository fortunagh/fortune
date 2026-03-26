import {
  authCardClass,
  authCardDescriptionClass,
  authCardTitleClass,
} from "@/components/auth/auth-ui-classes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cinzel } from "next/font/google";
import { Suspense } from "react";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

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
          <CardTitle
            className={`${cinzel.className} text-2xl font-semibold tracking-wide ${authCardTitleClass}`}
          >
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense>
            <ErrorContent searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
