"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Cinzel, Inter } from "next/font/google";
import { Check } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  getDialCode,
  phoneCountriesSorted,
} from "@/lib/data/phone-countries";
import { cn } from "@/lib/utils";
import {
  REQUEST_ACCESS_STEP_COUNT,
  REQUEST_ACCESS_STEP_META,
  type RequestAccessFormValues,
  requestAccessFormSchema,
  requestAccessStepSchemas,
} from "@/lib/validation/request-access";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/** Matches homepage “Request access” pill (without outer margin). */
export const requestAccessButtonClass =
  "group min-w-[min(88vw,280px)] rounded-full bg-[linear-gradient(90deg,#D4AF37_0%,#FFD988_46%,#D4AF37_100%)] px-10 py-3.5 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-neutral-900 shadow-sm transition-transform duration-300 ease-out will-change-transform hover:scale-[1.045] hover:shadow-[0_14px_36px_rgba(0,0,0,0.22)] active:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-w-[300px] sm:px-12 sm:py-4 sm:text-[0.78rem] md:min-w-[320px] md:text-[0.82rem]";

const contactMethodOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "zoom", label: "Zoom" },
  { value: "text", label: "Text message" },
] as const;

/** Form labels + step UI: same serif / caps / tracking as dialog title. */
const labelClass = `${cinzel.className} text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-800 sm:text-xs`;

/** Inputs, selects, textareas — Inter + explicit placeholder styling. */
const fieldControlClass = cn(
  inter.className,
  "text-sm text-neutral-900 placeholder:font-normal placeholder:text-neutral-500",
);

/** Validation errors — Inter, slightly smaller than label. */
const formMessageClass = cn(
  inter.className,
  "text-[11px] font-medium leading-snug",
);

/** Secondary actions — Cinzel to match dialog chrome. */
const secondaryActionClass = `${cinzel.className} rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors`;

const lastStepIndex = REQUEST_ACCESS_STEP_COUNT - 1;

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

function StepProgress({ step }: { step: number }) {
  const n = REQUEST_ACCESS_STEP_COUNT;
  /** Track spans circle-center to circle-center: (n-1)/n of total width. */
  const trackWidthPct = ((n - 1) / n) * 100;

  return (
    <div
      className="mb-5"
      role="group"
      aria-label={`Step ${step + 1} of ${n}: ${REQUEST_ACCESS_STEP_META[step]?.title ?? ""}`}
    >
      <div className="px-1 sm:px-2">
        {/* Row 1: line runs through vertical center of circles */}
        <div className="relative flex min-h-8 items-center justify-between sm:min-h-9">
          <div
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-1/2 z-0 h-[6px] -translate-y-1/2 rounded-full bg-neutral-100"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-[12.5%] top-1/2 z-0 h-[6px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#D4AF37_0%,#FFD988_50%,#D4AF37_100%)] transition-[width] duration-300 ease-out"
            style={{
              width: `${((step + 1) / n) * trackWidthPct}%`,
            }}
            aria-hidden
          />
          {REQUEST_ACCESS_STEP_META.map((meta, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={`dot-${meta.title}`}
                className="relative z-10 flex min-w-0 flex-1 justify-center"
              >
                <div
                  className={cn(
                    cinzel.className,
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold tabular-nums shadow-sm transition-colors sm:h-9 sm:w-9 sm:text-xs",
                    done &&
                      "border-amber-600 bg-gradient-to-br from-[#D4AF37] to-[#b8942a] text-white",
                    active &&
                      !done &&
                      "border-amber-600 bg-amber-50 text-amber-950",
                    !done &&
                      !active &&
                      "border-neutral-200 bg-white text-neutral-400",
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Row 2: labels aligned under circles */}
        <div className="mt-1.5 flex justify-between gap-1 sm:gap-2">
          {REQUEST_ACCESS_STEP_META.map((meta, i) => {
            const active = i === step;
            return (
              <div
                key={`label-${meta.title}`}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <span
                  className={cn(
                    cinzel.className,
                    "hidden max-w-[4.5rem] truncate text-center text-[10px] font-semibold tracking-[0.12em] text-neutral-500 sm:block sm:max-w-none sm:text-[11px]",
                    active && "text-amber-950",
                  )}
                >
                  {meta.short}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type RequestAccessButtonProps = {
  className?: string;
  ringOffsetClassName?: string;
};

export function RequestAccessButton({
  className,
  ringOffsetClassName,
}: RequestAccessButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const timezones = useTimeZoneOptions();

  const form = useForm<RequestAccessFormValues>({
    resolver: zodResolver(requestAccessFormSchema),
    defaultValues: {
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
    },
  });

  function onSubmit(values: RequestAccessFormValues) {
    const dial = getDialCode(values.phoneCountryIso2);
    const digits = values.mobileNumber.replace(/\D/g, "");
    const fullInternational = dial ? `+${dial}${digits}` : digits;
    setSubmitted(true);
    console.log("Request access submission", {
      ...values,
      fullInternationalNumber: fullInternational,
    });
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
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSubmitted(false);
      setStep(0);
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            cinzel.className,
            requestAccessButtonClass,
            ringOffsetClassName,
            className,
          )}
        >
          Request access
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[min(94dvh,860px)] w-[calc(100%-1.25rem)] max-w-2xl overflow-y-auto sm:max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {submitted ? (
          <div
            className="flex flex-col items-center px-2 py-6 text-center sm:px-4 sm:py-8"
            role="status"
            aria-live="polite"
          >
            <div className="relative mx-auto mb-8 flex h-[5.5rem] w-[5.5rem] items-center justify-center sm:mb-10 sm:h-24 sm:w-24">
              <div
                className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-success-ring"
                aria-hidden
              />
              <div
                className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-[linear-gradient(145deg,#E8C547_0%,#D4AF37_40%,#9a7328_100%)] shadow-[0_12px_40px_rgba(180,140,40,0.35)] sm:h-20 sm:w-20 animate-success-badge"
              >
                <Check
                  className="h-10 w-10 text-white drop-shadow-sm sm:h-11 sm:w-11 animate-success-check"
                  strokeWidth={2.75}
                  aria-hidden
                />
              </div>
            </div>
            <p
              className={`${cinzel.className} text-balance bg-gradient-to-b from-[#1a1a1a] via-[#3d3518] to-[#a67c32] bg-clip-text text-3xl font-bold uppercase leading-tight tracking-[0.06em] text-transparent sm:text-4xl md:text-[2.75rem]`}
            >
              Thank you
            </p>
            <p
              className={`${cinzel.className} mt-3 text-lg font-semibold uppercase tracking-[0.12em] text-neutral-800 sm:mt-4 sm:text-xl`}
            >
              Request received
            </p>
            <p
              className={`${inter.className} mx-auto mt-5 max-w-md text-base leading-relaxed text-neutral-600 sm:text-lg`}
            >
              If your profile aligns with our criteria, our team will be in
              touch.
            </p>
            <button
              type="button"
              className={`${inter.className} mt-8 rounded-full border border-neutral-200 bg-white px-6 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 sm:mt-10`}
              onClick={() => handleOpenChange(false)}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle
                className={`${cinzel.className} text-lg font-semibold uppercase tracking-[0.12em] text-neutral-900 sm:text-xl`}
              >
                Request access
              </DialogTitle>
              <DialogDescription
                className={`${inter.className} text-left text-sm leading-relaxed text-neutral-600`}
              >
                Complete each step. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>

            <StepProgress step={step} />

            <Form {...form}>
              <form
                className="space-y-4 pt-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === lastStepIndex) {
                    void form.handleSubmit(onSubmit)(e);
                  }
                }}
              >
                {step === 0 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                                className={fieldControlClass}
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
                                className={fieldControlClass}
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
                              className={fieldControlClass}
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
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] sm:items-start">
                      <FormField
                        control={form.control}
                        name="phoneCountryIso2"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className={labelClass}>
                              Country code *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger className={fieldControlClass}>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[min(280px,50vh)]">
                                {phoneCountriesSorted.map((c) => (
                                  <SelectItem key={c.iso2} value={c.iso2}>
                                    +{c.dialCode} · {c.name}
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
                        name="mobileNumber"
                        render={({ field }) => (
                          <FormItem className="min-w-0">
                            <FormLabel className={labelClass}>
                              Mobile number *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel-national"
                                placeholder="National number"
                                className={fieldControlClass}
                                {...field}
                              />
                            </FormControl>
                            <p
                              className={`${inter.className} text-[10px] text-neutral-500`}
                            >
                              Validated for the country you selected (include
                              leading 0 if your number uses one).
                            </p>
                            <FormMessage className={formMessageClass} />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@company.com"
                              autoComplete="email"
                              className={fieldControlClass}
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
                              className={fieldControlClass}
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
                              <SelectTrigger className={fieldControlClass}>
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
                              className={fieldControlClass}
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
                              <SelectTrigger className={fieldControlClass}>
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
                                "min-h-[72px] resize-y",
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
                                "min-h-[120px] resize-y",
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

                <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={cn(
                        secondaryActionClass,
                        "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                      )}
                      onClick={() => handleOpenChange(false)}
                    >
                      Cancel
                    </button>
                    {step > 0 && (
                      <button
                        type="button"
                        className={cn(
                          secondaryActionClass,
                          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                        )}
                        onClick={goBack}
                      >
                        Back
                      </button>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    {step < lastStepIndex ? (
                      <button
                        type="button"
                        className={cn(
                          cinzel.className,
                          requestAccessButtonClass,
                          "w-full min-w-[160px] sm:w-auto",
                        )}
                        onClick={goNext}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={cn(
                          cinzel.className,
                          requestAccessButtonClass,
                          "w-full min-w-[180px] sm:w-auto",
                        )}
                      >
                        Submit request
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
