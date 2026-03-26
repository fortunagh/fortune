import { isValidPhoneNumber } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { z } from "zod";

import { getDialCode } from "@/lib/data/phone-countries";


/** Validates national/international input against selected country (ISO2). */
export function validatePhoneForCountry(
  mobile: string,
  iso2: string,
): boolean {
  const country = iso2.toUpperCase() as CountryCode;
  const t = mobile.trim();
  if (!t) return false;

  try {
    if (isValidPhoneNumber(t, country)) return true;

    const digits = mobile.replace(/\D/g, "");
    if (!digits) return false;
    if (isValidPhoneNumber(digits, country)) return true;

    const dial = getDialCode(iso2);
    if (!dial) return false;
    const intl = `+${dial}${digits}`;
    return isValidPhoneNumber(intl);
  } catch {
    return false;
  }
}

function refinePhone(
  data: { mobileNumber: string; phoneCountryIso2: string },
  ctx: z.RefinementCtx,
) {
  if (!data.phoneCountryIso2 || data.phoneCountryIso2.length !== 2) return;
  if (!validatePhoneForCountry(data.mobileNumber, data.phoneCountryIso2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter a valid phone number for the selected country",
      path: ["mobileNumber"],
    });
  }
}

const baseFields = {
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name")
    .max(80, "Too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Enter your last name")
    .max(80, "Too long"),
  referralSource: z
    .string()
    .trim()
    .min(2, "Tell us who referred you or how you found us")
    .max(500, "Too long"),
  phoneCountryIso2: z
    .string()
    .min(2, "Select country code")
    .max(2, "Invalid country"),
  mobileNumber: z.string().min(1, "Enter your mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  city: z.string().trim().min(2, "Enter your city").max(120, "Too long"),
  timezone: z.string().min(1, "Select your time zone"),
  bestContactTimes: z
    .string()
    .trim()
    .min(2, "Describe the best times to reach you")
    .max(500, "Too long"),
  preferredContactMethod: z.enum(["whatsapp", "email", "zoom", "text"], {
    message: "Select a contact method",
  }),
  occupationOrBusiness: z
    .string()
    .trim()
    .min(2, "Describe your occupation or business")
    .max(500, "Too long"),
  platformInterest: z
    .string()
    .trim()
    .min(20, "Please write at least 20 characters")
    .max(2000, "Too long"),
};

export const requestAccessFormSchema = z
  .object(baseFields)
  .superRefine(refinePhone);

export type RequestAccessFormValues = z.infer<typeof requestAccessFormSchema>;

/** Per-step validation (0-based index). */
export const requestAccessStepSchemas = [
  z.object({
    firstName: baseFields.firstName,
    lastName: baseFields.lastName,
    referralSource: baseFields.referralSource,
  }),
  z
    .object({
      phoneCountryIso2: baseFields.phoneCountryIso2,
      mobileNumber: baseFields.mobileNumber,
      email: baseFields.email,
      city: baseFields.city,
    })
    .superRefine(refinePhone),
  z.object({
    timezone: baseFields.timezone,
    bestContactTimes: baseFields.bestContactTimes,
    preferredContactMethod: baseFields.preferredContactMethod,
  }),
  z.object({
    occupationOrBusiness: baseFields.occupationOrBusiness,
    platformInterest: baseFields.platformInterest,
  }),
] as const;

export const REQUEST_ACCESS_STEP_META = [
  { title: "Info", short: "Info" },
  { title: "Contact", short: "Contact" },
  { title: "Schedule", short: "Schedule" },
  { title: "Details", short: "Details" },
] as const;

export const REQUEST_ACCESS_STEP_COUNT = requestAccessStepSchemas.length;
