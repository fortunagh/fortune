declare module "country-telephone-data" {
  export type PhoneCountry = {
    name: string;
    iso2: string;
    dialCode: string;
    format?: string;
    priority?: number;
    hasAreaCodes?: boolean;
  };

  export const allCountries: PhoneCountry[];
  export const iso2Lookup: Record<string, number>;
}
