import { NextResponse } from "next/server";

import { getDialCode } from "@/lib/data/phone-countries";
import { createClient } from "@/lib/supabase/server";
import { requestAccessFormSchema } from "@/lib/validation/request-access";

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

  const supabase = await createClient();

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
    console.error("request_access insert error", error);
    return NextResponse.json(
      { error: "Could not save your request. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
