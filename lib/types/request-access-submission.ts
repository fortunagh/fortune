/** Row shape for `public.request_access_submissions`. */
export type RequestAccessSubmissionRow = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  referral_source: string;
  phone_country_iso2: string;
  mobile_number: string;
  phone_e164: string | null;
  email: string;
  city: string;
  timezone: string;
  best_contact_times: string;
  /** Contact preference: WhatsApp, email, Zoom, or text */
  preferred_contact_method: "whatsapp" | "email" | "zoom" | "text";
  occupation_or_business: string;
  platform_interest: string;
};
