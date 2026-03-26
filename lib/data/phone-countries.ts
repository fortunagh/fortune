import { allCountries } from "country-telephone-data";
import type { PhoneCountry } from "country-telephone-data";

/** All countries with dial codes, sorted A–Z for selects. */
export const phoneCountriesSorted: PhoneCountry[] = [...allCountries].sort(
  (a, b) => a.name.localeCompare(b.name, "en"),
);

export function getDialCode(iso2: string): string | undefined {
  const c = phoneCountriesSorted.find(
    (x) => x.iso2.toLowerCase() === iso2.toLowerCase(),
  );
  return c?.dialCode;
}
