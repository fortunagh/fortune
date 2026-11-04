import {
  BronzeRule,
  Eyebrow,
  PortalCard,
  PortalTitle,
} from "@/components/portal/portal-primitives";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <Eyebrow>Preferences</Eyebrow>
        <PortalTitle className="mt-2">Settings</PortalTitle>
        <BronzeRule className="mt-4" />
      </div>
      <PortalCard className="flex items-center justify-between gap-4 p-6">
        <div>
          <p className="font-[Arial,Helvetica,sans-serif] text-xs font-semibold uppercase tracking-[0.14em]">
            Appearance
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Dark is the Fortuna portal default. Light matches the public site.
          </p>
        </div>
        <ThemeSwitcher />
      </PortalCard>
    </div>
  );
}
