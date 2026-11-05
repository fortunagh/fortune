import {
  PageHeader,
  PortalMuted,
  WidgetCard,
} from "@/components/portal/portal-ui";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Account preferences for your Fortuna portal."
      />
      <WidgetCard>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Appearance
        </p>
        <PortalMuted className="mt-1">
          The Fortuna portal uses a light theme only.
        </PortalMuted>
      </WidgetCard>
    </div>
  );
}
