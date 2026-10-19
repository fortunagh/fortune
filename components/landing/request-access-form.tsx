"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";

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
import { PhoneCountryPicker } from "@/components/landing/phone-country-picker";
import { cn } from "@/lib/utils";
import {
  REQUEST_ACCESS_STEP_COUNT,
  REQUEST_ACCESS_STEP_META,
  type RequestAccessFormValues,
  requestAccessFormSchema,
  requestAccessStepSchemas,
} from "@/lib/validation/request-access";

import "@/components/landing/fortuna.css";

/** Homepage display / body / UI stacks (Fortuna Bodoni, Garamond, Arial). */
const fontDisplay =
  "font-['Fortuna_Bodoni',Didot,'Times_New_Roman',serif]";
const fontBody = "font-['Fortuna_Garamond',Georgia,serif]";
const fontUi = "font-[Arial,Helvetica,sans-serif]";

/** Matches homepage `.button` — bronze outline, Arial uppercase. */
export const requestAccessButtonClass = cn(
  fontUi,
  "inline-flex min-h-12 min-w-[min(88vw,240px)] items-center justify-center gap-3 border border-[#a84d0b] bg-transparent px-8 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.09em] text-[#a84d0b] transition-[background,color] duration-150 hover:bg-[#a84d0b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a84d0b]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f1ea] sm:min-w-[260px] sm:text-sm",
);

const contactMethodOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "zoom", label: "Zoom" },
  { value: "text", label: "Text message" },
] as const;

const labelClass = cn(
  fontUi,
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[#101217] sm:text-xs",
);

const fieldControlClass = cn(
  fontUi,
  "rounded-none border-[#b9764a55] bg-white text-sm text-[#101217] placeholder:font-normal placeholder:text-neutral-500 focus-visible:ring-[#a84d0b]/30",
);

const formMessageClass = cn(
  fontUi,
  "text-[11px] font-medium leading-snug",
);

const secondaryActionClass = cn(
  fontUi,
  "px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#101217] transition-colors",
);

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

function StepProgress({ step }: { step: number }) {
  const n = REQUEST_ACCESS_STEP_COUNT;
  const trackWidthPct = ((n - 1) / n) * 100;

  return (
    <div
      className="mb-5 form-request-progress "
      role="group"
      aria-label={`Step ${step + 1} of ${n}: ${REQUEST_ACCESS_STEP_META[step]?.title ?? ""}`}
    >
      <div className="px-1 sm:px-2">
        <div className="relative flex min-h-8 items-center justify-between sm:min-h-9">
          <div
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-1/2 z-0 h-px -translate-y-1/2 bg-[#b9764a40]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute left-[12.5%] top-1/2 z-0 h-px -translate-y-1/2 bg-[#a84d0b] transition-[width] duration-300 ease-out"
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
                    fontUi,
                    "flex h-8 w-8 shrink-0 items-center justify-center border text-[11px] font-semibold tabular-nums transition-colors sm:h-9 sm:w-9 sm:text-xs",
                    done && "border-[#a84d0b] bg-[#a84d0b] text-white",
                    active &&
                      !done &&
                      "border-[#a84d0b] bg-[#f5f1ea] text-[#a84d0b]",
                    !done &&
                      !active &&
                      "border-[#b9764a55] bg-white text-neutral-400",
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
                    fontUi,
                    "hidden max-w-[4.5rem] truncate text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 sm:block sm:max-w-none sm:text-[11px]",
                    active && "text-[#a84d0b]",
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

export type RequestAccessFormPanelProps = {
  title?: string;
  description?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onSubmitted?: () => void;
  className?: string;
};

export function RequestAccessFormPanel({
  title = "Request access",
  description = "Complete each step. Fields marked with * are required.",
  cancelLabel = "Cancel",
  onCancel,
  onSubmitted,
  className,
}: RequestAccessFormPanelProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const timezones = useTimeZoneOptions();

  const form = useForm<RequestAccessFormValues>({
    resolver: zodResolver(requestAccessFormSchema),
    defaultValues,
  });

  function resetAll() {
    setSubmitted(false);
    setStep(0);
    setSubmitError(null);
    form.reset(defaultValues);
  }

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
      onSubmitted?.();
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
    setStep((s) => Math.max(s - 1, 0));
  }

  if (submitted) {
    return (
      <div
        className={cn(
          "flex flex-col items-center px-2 py-6 text-center sm:px-4 sm:py-8",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <div className="relative mx-auto mb-8 flex h-[5.5rem] w-[5.5rem] items-center justify-center sm:mb-10 sm:h-24 sm:w-24">
          <div
            className="absolute inset-0 border border-[#a84d0b]/40 animate-success-ring"
            aria-hidden
          />
          <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center border border-[#a84d0b] bg-[#a84d0b] text-white sm:h-20 sm:w-20 animate-success-badge">
            <Check
              className="h-10 w-10 text-white sm:h-11 sm:w-11 animate-success-check"
              strokeWidth={2.75}
              aria-hidden
            />
          </div>
        </div>
        <p
          className={`${fontDisplay} text-balance text-3xl font-medium uppercase leading-tight tracking-[-0.03em] text-[#101217] sm:text-4xl md:text-[2.75rem]`}
        >
          Thank you
        </p>
        <p
          className={`${fontUi} mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#a84d0b] sm:mt-4 sm:text-base`}
        >
          Request received
        </p>
        <p
          className={`${fontBody} mx-auto mt-5 max-w-md text-base leading-relaxed text-[#101217]/80 sm:text-lg`}
        >
          If your profile aligns with our criteria, our team will be in touch.
        </p>
        {onCancel ? (
          <button
            type="button"
            className={cn(requestAccessButtonClass, "mt-8 sm:mt-10")}
            onClick={() => {
              resetAll();
              onCancel();
            }}
          >
            Close
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4 space-y-2">
        <h2
          className={`${fontDisplay} text-xl font-medium uppercase tracking-[-0.03em] text-[#101217] sm:text-2xl`}
        >
          {title}
        </h2>
        <div className="h-px w-10 bg-[#a84d0b]" aria-hidden />
        <p
          className={`${fontBody} text-left text-sm leading-relaxed text-[#101217]/75 sm:text-[15px]`}
        >
          {description}
        </p>
      </div>

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
                      <FormLabel className={labelClass}>First name *</FormLabel>
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
                      <FormLabel className={labelClass}>Last name *</FormLabel>
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
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>
                      Mobile number *
                    </FormLabel>
                    <div className="flex min-h-10 items-stretch border border-[#b9764a55] bg-white focus-within:ring-2 focus-within:ring-[#a84d0b]/30">
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
                            "h-auto min-h-10 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0",
                          )}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <p className={`${fontUi} text-[10px] text-neutral-500`}>
                      Validated for the country you selected (include leading 0
                      if your number uses one).
                    </p>
                    <FormMessage className={formMessageClass} />
                    {form.formState.errors.phoneCountryIso2?.message ? (
                      <p className={cn(formMessageClass, "text-destructive")}>
                        {form.formState.errors.phoneCountryIso2.message}
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
                    <FormLabel className={labelClass}>Time zone *</FormLabel>
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

          {submitError && (
            <p
              className={`${fontUi} border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800`}
              role="alert"
            >
              {submitError}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-[#b9764a40] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {onCancel ? (
                <button
                  type="button"
                  className={cn(
                    secondaryActionClass,
                    "hover:text-[#a84d0b]",
                  )}
                  onClick={onCancel}
                >
                  {cancelLabel}
                </button>
              ) : null}
              {step > 0 && (
                <button
                  type="button"
                  className={cn(
                    secondaryActionClass,
                    "hover:text-[#a84d0b]",
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
                    requestAccessButtonClass,
                    "w-full min-w-[160px] sm:w-auto sm:min-w-[180px]",
                  )}
                  onClick={goNext}
                >
                  Continue <span aria-hidden="true">⟶</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    requestAccessButtonClass,
                    "w-full min-w-[180px] disabled:pointer-events-none disabled:opacity-60 sm:w-auto",
                  )}
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
  );
}

/** @deprecated Kept for callers; now maps to homepage UI / body stacks. */
export const requestAccessCinzel = { className: fontUi };
export const requestAccessInter = { className: fontBody };
