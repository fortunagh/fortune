import {
  PageHeader,
  PortalMuted,
  WidgetCard,
} from "@/components/portal/portal-ui";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Appearance and account preferences."
      />
      <WidgetCard className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Appearance
          </p>
          <PortalMuted className="mt-1">
            Light is the portal default. Dark remains available.
          </PortalMuted>
        </div>
        <ThemeSwitcher />
      </WidgetCard>
    </div>
  );
}
