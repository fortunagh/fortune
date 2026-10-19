import { allCountries } from "country-telephone-data";
import type { PhoneCountry } from "country-telephone-data";

/** All countries with dial codes, sorted A–Z for selects. */
export const phoneCountriesSorted: PhoneCountry[] = [...allCountries].sort(
  (a, b) => a.name.localeCompare(b.name, "en"),
);

export function getDialCode(iso2: string): string | undefined {
  return getPhoneCountry(iso2)?.dialCode;
}

export function getPhoneCountry(iso2: string): PhoneCountry | undefined {
  if (!iso2) return undefined;
  return phoneCountriesSorted.find(
    (x) => x.iso2.toLowerCase() === iso2.toLowerCase(),
  );
}

/** Regional indicator flag emoji from ISO 3166-1 alpha-2. */
export function flagEmoji(iso2: string): string {
  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return "🌐";
  const chars = [...code];
  if (chars.some((c) => c < "A" || c > "Z")) return "🌐";
  return String.fromCodePoint(
    ...chars.map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
}

/** Common IANA time zones → ISO2 (fallback when locale has no region). */
const TIMEZONE_COUNTRY: Record<string, string> = {
  "America/New_York": "us",
  "America/Chicago": "us",
  "America/Denver": "us",
  "America/Los_Angeles": "us",
  "America/Phoenix": "us",
  "America/Toronto": "ca",
  "America/Vancouver": "ca",
  "America/Mexico_City": "mx",
  "America/Sao_Paulo": "br",
  "America/Argentina/Buenos_Aires": "ar",
  "Europe/London": "gb",
  "Europe/Dublin": "ie",
  "Europe/Paris": "fr",
  "Europe/Berlin": "de",
  "Europe/Madrid": "es",
  "Europe/Rome": "it",
  "Europe/Amsterdam": "nl",
  "Europe/Brussels": "be",
  "Europe/Zurich": "ch",
  "Europe/Vienna": "at",
  "Europe/Stockholm": "se",
  "Europe/Oslo": "no",
  "Europe/Copenhagen": "dk",
  "Europe/Helsinki": "fi",
  "Europe/Warsaw": "pl",
  "Europe/Prague": "cz",
  "Europe/Budapest": "hu",
  "Europe/Bucharest": "ro",
  "Europe/Athens": "gr",
  "Europe/Istanbul": "tr",
  "Europe/Moscow": "ru",
  "Europe/Lisbon": "pt",
  "Asia/Dubai": "ae",
  "Asia/Qatar": "qa",
  "Asia/Riyadh": "sa",
  "Asia/Kuwait": "kw",
  "Asia/Bahrain": "bh",
  "Asia/Muscat": "om",
  "Asia/Karachi": "pk",
  "Asia/Kolkata": "in",
  "Asia/Calcutta": "in",
  "Asia/Colombo": "lk",
  "Asia/Dhaka": "bd",
  "Asia/Kathmandu": "np",
  "Asia/Bangkok": "th",
  "Asia/Singapore": "sg",
  "Asia/Kuala_Lumpur": "my",
  "Asia/Jakarta": "id",
  "Asia/Manila": "ph",
  "Asia/Hong_Kong": "hk",
  "Asia/Shanghai": "cn",
  "Asia/Taipei": "tw",
  "Asia/Tokyo": "jp",
  "Asia/Seoul": "kr",
  "Asia/Jerusalem": "il",
  "Australia/Sydney": "au",
  "Australia/Melbourne": "au",
  "Australia/Perth": "au",
  "Pacific/Auckland": "nz",
  "Africa/Cairo": "eg",
  "Africa/Johannesburg": "za",
  "Africa/Lagos": "ng",
  "Africa/Nairobi": "ke",
};

function normalizeIso2(code: string | undefined | null): string | null {
  if (!code || code.length !== 2) return null;
  const iso = code.toLowerCase();
  return getPhoneCountry(iso) ? iso : null;
}

/**
 * Best-effort client country detection (locale region → timezone map).
 * No network call.
 */
export function detectCountryIso2(): string | null {
  if (typeof window === "undefined") return null;

  const languages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean);

  for (const lang of languages) {
    try {
      const locale = new Intl.Locale(lang);
      const region =
        locale.region ??
        (typeof locale.maximize === "function"
          ? locale.maximize().region
          : undefined);
      const hit = normalizeIso2(region);
      if (hit) return hit;
    } catch {
      const parts = lang.split(/[-_]/);
      const maybe = parts.find((p) => p.length === 2 && /^[A-Za-z]{2}$/.test(p));
      const hit = normalizeIso2(maybe);
      if (hit) return hit;
    }
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY[tz]) {
      return normalizeIso2(TIMEZONE_COUNTRY[tz]);
    }
  } catch {
    /* ignore */
  }

  return null;
}
