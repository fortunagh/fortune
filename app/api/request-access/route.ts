import { NextResponse } from "next/server";

import { getDialCode } from "@/lib/data/phone-countries";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requestAccessFormSchema } from "@/lib/validation/request-access";

function getInsertClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || (!publishable && !serviceRole)) {
    return {
      error: NextResponse.json(
        {
          error:
            "Server is missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or publishable key) in the host environment.",
        },
        { status: 500 },
      ),
    } as const;
  }

  // Prefer service role so public form inserts are not blocked by RLS gaps.
  if (serviceRole) {
    try {
      return { client: createServiceRoleClient() } as const;
    } catch {
      /* fall through */
    }
  }

  return { useCookieClient: true } as const;
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestAccessFormSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const values = parsed.data;
  const dial = getDialCode(values.phoneCountryIso2);
  const digits = values.mobileNumber.replace(/\D/g, "");
  const phone_e164 =
    dial && digits ? `+${dial}${digits}` : digits ? `+${digits}` : null;

  const resolved = getInsertClient();
  if ("error" in resolved) {
    return resolved.error;
  }

  const supabase = resolved.useCookieClient
    ? await createClient()
    : resolved.client;

  const { error } = await supabase.from("request_access_submissions").insert({
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    referral_source: values.referralSource.trim(),
    phone_country_iso2: values.phoneCountryIso2.toUpperCase(),
    mobile_number: values.mobileNumber.trim(),
    phone_e164,
    email: values.email.trim().toLowerCase(),
    city: values.city.trim(),
    timezone: values.timezone,
    best_contact_times: values.bestContactTimes.trim(),
    preferred_contact_method: values.preferredContactMethod,
    occupation_or_business: values.occupationOrBusiness.trim(),
    platform_interest: values.platformInterest.trim(),
  });

  if (error) {
    console.error("request_access insert error", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      {
        error: "Could not save your request. Please try again later.",
        code: error.code,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
