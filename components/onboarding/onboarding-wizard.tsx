"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";

import { PhoneCountryPicker } from "@/components/landing/phone-country-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  REQUEST_ACCESS_STEP_COUNT,
  REQUEST_ACCESS_STEP_META,
  type RequestAccessFormValues,
  requestAccessFormSchema,
  requestAccessStepSchemas,
} from "@/lib/validation/request-access";

import "@/components/landing/fortuna.css";

const fontDisplay =
  "font-['Fortuna_Bodoni',Didot,'Times_New_Roman',serif]";
const fontBody = "font-['Fortuna_Garamond',Georgia,serif]";
const fontUi = "font-[Arial,Helvetica,sans-serif]";

const primaryBtnClass = cn(
  fontUi,
  "inline-flex min-h-12 min-w-[160px] items-center justify-center gap-2 border border-[#a84d0b] bg-transparent px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.09em] text-[#a84d0b] transition-[background,color] duration-150 hover:bg-[#a84d0b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84d0b]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f1ea] disabled:pointer-events-none disabled:opacity-60 sm:text-sm",
);

const secondaryBtnClass = cn(
  fontUi,
  "inline-flex min-h-12 items-center justify-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#101217] transition-colors hover:text-[#a84d0b] sm:text-sm",
);

const labelClass = cn(
  fontUi,
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#101217] sm:text-xs",
);

const fieldControlClass = cn(
  fontUi,
  "rounded-none border-[#b9764a55] bg-white text-sm text-[#101217] placeholder:font-normal placeholder:text-neutral-500 focus-visible:ring-[#a84d0b]/30",
);

const formMessageClass = cn(fontUi, "text-[11px] font-medium leading-snug");

const contactMethodOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "zoom", label: "Zoom" },
  { value: "text", label: "Text message" },
] as const;

const STEP_COPY = [
  {
    headline: "Tell us who you are",
    sub: "A few details so we know how you found Fortuna.",
  },
  {
    headline: "How we reach you",
    sub: "Your contact details for a private follow-up.",
  },
  {
    headline: "When to connect",
    sub: "Help us schedule a conversation that fits your day.",
  },
  {
    headline: "Your interest",
    sub: "Share what brings you here — selectivity starts with fit.",
  },
] as const;

const lastStepIndex = REQUEST_ACCESS_STEP_COUNT - 1;

const defaultValues: RequestAccessFormValues = {
  firstName: "",
  lastName: "",
  referralSource: "",
  phoneCountryIso2: "",
  mobileNumber: "",
  email: "",
  city: "",
  timezone: "",
  bestContactTimes: "",
  occupationOrBusiness: "",
  platformInterest: "",
  preferredContactMethod:
    undefined as unknown as RequestAccessFormValues["preferredContactMethod"],
};

function useTimeZoneOptions(): string[] {
  return React.useMemo(() => {
    try {
      if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
        return Intl.supportedValuesOf("timeZone").sort((a, b) =>
          a.localeCompare(b),
        );
      }
    } catch {
      /* fall through */
    }
    return [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Dubai",
      "Asia/Singapore",
      "Australia/Sydney",
    ];
  }, []);
}

export function OnboardingWizard() {
  const [submitted, setSubmitted] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const timezones = useTimeZoneOptions();

  const form = useForm<RequestAccessFormValues>({
    resolver: zodResolver(requestAccessFormSchema),
    defaultValues,
  });

  async function onSubmit(values: RequestAccessFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setSubmitError(
          data.error ?? "Could not submit your request. Please try again.",
        );
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function goNext() {
    const schema = requestAccessStepSchemas[step];
    const result = schema.safeParse(form.getValues());
    if (!result.success) {
      form.clearErrors();
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          form.setError(key as keyof RequestAccessFormValues, {
            message: issue.message,
          });
        }
      }
      return;
    }
    form.clearErrors();
    setStep((s) => Math.min(s + 1, lastStepIndex));
  }

  function goBack() {
    form.clearErrors();
    setSubmitError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  const progressPct = ((step + 1) / REQUEST_ACCESS_STEP_COUNT) * 100;

  if (submitted) {
    return (
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "url('/fortuna/artwork-plate.png')",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "min(1400px, 180%) auto",
          }}
        />
        <div className="relative z-10 flex max-w-lg flex-col items-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center border border-[#a84d0b] bg-[#a84d0b] text-white sm:mb-10 sm:h-20 sm:w-20">
            <Check className="h-9 w-9 sm:h-11 sm:w-11" strokeWidth={2.5} />
          </div>
          <p
            className={`${fontDisplay} text-3xl font-medium uppercase tracking-[-0.03em] text-[#101217] sm:text-4xl`}
          >
            Thank you
          </p>
          <p
            className={`${fontUi} mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a84d0b]`}
          >
            Request received
          </p>
          <p
            className={`${fontBody} mx-auto mt-5 max-w-md text-base leading-relaxed text-[#101217]/80 sm:text-lg`}
          >
            If your profile aligns with our criteria, our team will be in touch.
          </p>
          <Link href="/" className={cn(primaryBtnClass, "mt-10")}>
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-[minmax(280px,38%)_1fr]">
      {/* Brand panel — desktop */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[#b9764a40] px-8 py-10 lg:flex xl:px-12 xl:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: "url('/fortuna/artwork-plate.png')",
            backgroundPosition: "left top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(168,77,11,0.1),transparent_55%)]"
        />

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={1005}
              height={258}
              priority
              quality={100}
              unoptimized
              className="h-auto w-[min(240px,100%)]"
            />
          </Link>
          <p
            className={`${fontUi} mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a84d0b]`}
          >
            Private onboarding
          </p>
          <h1
            className={`${fontDisplay} mt-3 text-[clamp(1.75rem,2.8vw,2.4rem)] font-medium uppercase leading-[1.15] tracking-[-0.03em] text-[#101217]`}
          >
            Access is
            <br />
            selective
          </h1>
          <p
            className={`${fontBody} mt-4 max-w-xs text-[15px] leading-relaxed text-[#101217]/75`}
          >
            Complete each step. Your request is reviewed before access is
            granted.
          </p>
        </div>

        <nav
          className="relative z-10 mt-12 space-y-1"
          aria-label="Onboarding steps"
        >
          {REQUEST_ACCESS_STEP_META.map((meta, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={meta.title}
                className={cn(
                  fontUi,
                  "flex items-center gap-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]",
                  active && "text-[#a84d0b]",
                  done && "text-[#101217]",
                  !done && !active && "text-neutral-400",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center border text-[11px]",
                    done && "border-[#a84d0b] bg-[#a84d0b] text-white",
                    active &&
                      !done &&
                      "border-[#a84d0b] bg-[#f5f1ea] text-[#a84d0b]",
                    !done &&
                      !active &&
                      "border-[#b9764a55] bg-transparent text-neutral-400",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                {meta.title}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Form panel */}
      <section className="relative flex min-h-dvh flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] lg:opacity-[0.05]"
          style={{
            backgroundImage: "url('/fortuna/artwork-plate.png')",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "min(1200px, 160%) auto",
          }}
        />

        {/* Mobile header */}
        <header className="relative z-10 border-b border-[#b9764a40] px-5 py-4 lg:hidden">
          <Link href="/" className="inline-block">
            <Image
              src="/fortuna/logo-header.png"
              alt="Fortuna Global Holdings"
              width={1005}
              height={258}
              priority
              quality={100}
              unoptimized
              className="h-auto w-[min(200px,70vw)]"
            />
          </Link>
          <p
            className={`${fontUi} mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a84d0b]`}
          >
            Private onboarding · Step {step + 1} of {REQUEST_ACCESS_STEP_COUNT}
          </p>
          <div className="mt-3 h-px w-full bg-[#b9764a40]">
            <div
              className="h-px bg-[#a84d0b] transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        {/* Desktop progress */}
        <div className="relative z-10 hidden border-b border-[#b9764a40] px-8 py-4 lg:block xl:px-14">
          <div className="flex items-center justify-between gap-4">
            <p
              className={`${fontUi} text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a84d0b]`}
            >
              Step {step + 1} of {REQUEST_ACCESS_STEP_COUNT} ·{" "}
              {REQUEST_ACCESS_STEP_META[step]?.title}
            </p>
            <p
              className={`${fontUi} text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-500`}
            >
              {Math.round(progressPct)}%
            </p>
          </div>
          <div className="mt-3 h-px w-full bg-[#b9764a40]">
            <div
              className="h-px bg-[#a84d0b] transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
            <div className="mb-8 sm:mb-10">
              <h2
                className={`${fontDisplay} text-[clamp(1.65rem,4vw,2.35rem)] font-medium uppercase leading-[1.12] tracking-[-0.03em] text-[#101217]`}
              >
                {STEP_COPY[step]?.headline}
              </h2>
              <div className="mt-3 h-px w-10 bg-[#a84d0b]" aria-hidden />
              <p
                className={`${fontBody} mt-3 text-sm leading-relaxed text-[#101217]/75 sm:text-base`}
              >
                {STEP_COPY[step]?.sub}
              </p>
            </div>

            <Form {...form}>
              <form
                className="flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === lastStepIndex) {
                    void form.handleSubmit(onSubmit)(e);
                  }
                }}
              >
                <div className="flex-1 space-y-5">
                  {step === 0 && (
                    <>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelClass}>
                                First name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Jane"
                                  autoComplete="given-name"
                                  className={cn(fieldControlClass, "min-h-12")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className={formMessageClass} />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelClass}>
                                Last name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Doe"
                                  autoComplete="family-name"
                                  className={cn(fieldControlClass, "min-h-12")}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className={formMessageClass} />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="referralSource"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Who referred you, or how did you find us? *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Name, event, publication, etc."
                                className={cn(fieldControlClass, "min-h-12")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <FormField
                        control={form.control}
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Mobile number *
                            </FormLabel>
                            <div className="flex min-h-12 items-stretch border border-[#b9764a55] bg-white focus-within:ring-2 focus-within:ring-[#a84d0b]/30">
                              <FormField
                                control={form.control}
                                name="phoneCountryIso2"
                                render={({ field: countryField }) => (
                                  <PhoneCountryPicker
                                    value={countryField.value}
                                    onChange={countryField.onChange}
                                  />
                                )}
                              />
                              <FormControl>
                                <Input
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel-national"
                                  placeholder="National number"
                                  className={cn(
                                    fieldControlClass,
                                    "h-auto min-h-12 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0",
                                  )}
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <p
                              className={`${fontUi} text-[10px] text-neutral-500`}
                            >
                              Validated for the country you selected (include
                              leading 0 if your number uses one).
                            </p>
                            <FormMessage className={formMessageClass} />
                            {form.formState.errors.phoneCountryIso2
                              ?.message ? (
                              <p
                                className={cn(
                                  formMessageClass,
                                  "text-destructive",
                                )}
                              >
                                {
                                  form.formState.errors.phoneCountryIso2
                                    .message
                                }
                              </p>
                            ) : null}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Email *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="you@company.com"
                                autoComplete="email"
                                className={cn(fieldControlClass, "min-h-12")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              City you reside in *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City"
                                autoComplete="address-level2"
                                className={cn(fieldControlClass, "min-h-12")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Time zone *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(fieldControlClass, "min-h-12")}
                                >
                                  <SelectValue placeholder="Select time zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[min(280px,50vh)]">
                                {timezones.map((tz) => (
                                  <SelectItem key={tz} value={tz}>
                                    {tz.replace(/_/g, " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bestContactTimes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Best times of day to contact you *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Weekdays 9am–5pm, your local time"
                                className={cn(fieldControlClass, "min-h-12")}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Preferred contact method *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(fieldControlClass, "min-h-12")}
                                >
                                  <SelectValue placeholder="Select method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contactMethodOptions.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <FormField
                        control={form.control}
                        name="occupationOrBusiness"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              Occupation / business (if you own a business) *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Your role, industry, or business name"
                                className={cn(
                                  fieldControlClass,
                                  "min-h-[88px] resize-y",
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="platformInterest"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>
                              What is your interest in the platform? *
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please explain what you are looking for and why this environment is a fit."
                                className={cn(
                                  fieldControlClass,
                                  "min-h-[140px] resize-y",
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {submitError ? (
                    <p
                      className={`${fontUi} border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800`}
                      role="alert"
                    >
                      {submitError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-10 flex flex-col-reverse gap-3 border-t border-[#b9764a40] pt-6 sm:mt-auto sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {step > 0 ? (
                      <button
                        type="button"
                        className={secondaryBtnClass}
                        onClick={goBack}
                      >
                        Back
                      </button>
                    ) : (
                      <Link href="/" className={secondaryBtnClass}>
                        Cancel
                      </Link>
                    )}
                  </div>
                  <div className="flex justify-stretch sm:justify-end">
                    {step < lastStepIndex ? (
                      <button
                        type="button"
                        className={cn(primaryBtnClass, "w-full sm:w-auto")}
                        onClick={goNext}
                      >
                        Continue <span aria-hidden="true">⟶</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(primaryBtnClass, "w-full sm:w-auto")}
                      >
                        {isSubmitting ? "Submitting…" : "Submit request"}
                        {!isSubmitting ? (
                          <span aria-hidden="true">⟶</span>
                        ) : null}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}
