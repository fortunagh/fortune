"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { AdminStatus } from "@/components/admin/ui/admin-status";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableEmpty,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
  AdminTableShell,
} from "@/components/admin/ui/admin-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStepDef } from "@/lib/onboarding/steps";

type Resource = {
  id: string;
  title: string;
  kind: string;
  external_url: string | null;
  published: boolean;
  related_step_keys: string[] | null;
};

type Broker = {
  id: string;
  name: string;
  referral_url: string | null;
  secure_portal_url: string | null;
  active: boolean;
};

type Reminder = {
  id: string;
  step_key: string;
  delay_hours: number;
  enabled: boolean;
};

type Step = { key: string; title: string };

export function AdminContentForms({
  resources,
  brokers,
  reminderRules,
  steps,
}: {
  resources: Resource[];
  brokers: Broker[];
  reminderRules: Reminder[];
  steps: Step[];
}) {
  const router = useRouter();
  const [resourceDialog, setResourceDialog] = React.useState<
    null | "create" | Resource
  >(null);
  const [brokerDialog, setBrokerDialog] = React.useState<
    null | "create" | Broker
  >(null);
  const [deleteTarget, setDeleteTarget] = React.useState<
    null | { type: "resource" | "broker"; id: string; label: string }
  >(null);
  const [busy, setBusy] = React.useState(false);

  async function mutate(
    path: string,
    method: string,
    body?: unknown,
    success = "Saved",
  ) {
    setBusy(true);
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Request failed");
      toast.success(success);
      router.refresh();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Request failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="brokers">Brokers</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="fortuna"
              size="sm"
              onClick={() => setResourceDialog("create")}
            >
              <Plus className="size-3.5" />
              Add resource
            </Button>
          </div>
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Title</AdminTableHead>
                  <AdminTableHead>Kind</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead className="text-right">Actions</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {resources.length === 0 ? (
                  <AdminTableEmpty colSpan={4}>No resources yet.</AdminTableEmpty>
                ) : (
                  resources.map((r) => (
                    <AdminTableRow key={r.id}>
                      <AdminTableCell className="font-medium">
                        {r.title}
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {(r.related_step_keys ?? [])
                            .map((k) => getStepDef(k)?.title ?? k)
                            .join(", ") || "No steps"}
                        </p>
                      </AdminTableCell>
                      <AdminTableCell className="uppercase text-xs">
                        {r.kind}
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminStatus
                          status={r.published ? "published" : "draft"}
                        />
                      </AdminTableCell>
                      <AdminTableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              mutate(
                                `/api/admin/content/resource/${r.id}`,
                                "PATCH",
                                { published: !r.published },
                                r.published ? "Unpublished" : "Published",
                              )
                            }
                          >
                            {r.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setResourceDialog(r)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                type: "resource",
                                id: r.id,
                                label: r.title,
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>

        <TabsContent value="brokers" className="space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="fortuna"
              size="sm"
              onClick={() => setBrokerDialog("create")}
            >
              <Plus className="size-3.5" />
              Add broker
            </Button>
          </div>
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Name</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead className="text-right">Actions</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {brokers.length === 0 ? (
                  <AdminTableEmpty colSpan={3}>No brokers yet.</AdminTableEmpty>
                ) : (
                  brokers.map((b) => (
                    <AdminTableRow key={b.id}>
                      <AdminTableCell className="font-medium">{b.name}</AdminTableCell>
                      <AdminTableCell>
                        <AdminStatus status={b.active ? "active" : "closed"} />
                      </AdminTableCell>
                      <AdminTableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              mutate(
                                `/api/admin/content/broker/${b.id}`,
                                "PATCH",
                                { active: !b.active },
                                b.active ? "Deactivated" : "Activated",
                              )
                            }
                          >
                            {b.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setBrokerDialog(b)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() =>
                              setDeleteTarget({
                                type: "broker",
                                id: b.id,
                                label: b.name,
                              })
                            }
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>

        <TabsContent value="reminders">
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Step</AdminTableHead>
                  <AdminTableHead>Delay (hours)</AdminTableHead>
                  <AdminTableHead>Enabled</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {reminderRules.length === 0 ? (
                  <AdminTableEmpty colSpan={3}>
                    No reminder rules.
                  </AdminTableEmpty>
                ) : (
                  reminderRules.map((r) => (
                    <AdminTableRow key={r.id}>
                      <AdminTableCell>
                        {getStepDef(r.step_key)?.title ?? r.step_key}
                      </AdminTableCell>
                      <AdminTableCell>
                        <Input
                          type="number"
                          min={0}
                          defaultValue={r.delay_hours}
                          className="h-8 w-24"
                          onBlur={async (e) => {
                            const delayHours = Number(e.target.value);
                            if (
                              !Number.isFinite(delayHours) ||
                              delayHours === r.delay_hours
                            )
                              return;
                            await mutate(
                              `/api/admin/content/reminder/${r.id}`,
                              "PATCH",
                              { delayHours },
                              "Delay updated",
                            );
                          }}
                        />
                      </AdminTableCell>
                      <AdminTableCell>
                        <Checkbox
                          checked={r.enabled}
                          onCheckedChange={(checked) =>
                            mutate(
                              `/api/admin/content/reminder/${r.id}`,
                              "PATCH",
                              { enabled: checked === true },
                              checked ? "Enabled" : "Disabled",
                            )
                          }
                        />
                      </AdminTableCell>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>

        <TabsContent value="steps">
          <AdminTableShell>
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow className="hover:bg-transparent">
                  <AdminTableHead>Title</AdminTableHead>
                  <AdminTableHead>Key</AdminTableHead>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {steps.map((s) => (
                  <AdminTableRow key={s.key}>
                    <AdminTableCell className="font-medium">{s.title}</AdminTableCell>
                    <AdminTableCell className="font-mono text-xs text-neutral-500">
                      {s.key}
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          </AdminTableShell>
        </TabsContent>
      </Tabs>

      <ResourceDialog
        open={resourceDialog !== null}
        initial={resourceDialog === "create" ? null : resourceDialog}
        steps={steps}
        busy={busy}
        onClose={() => setResourceDialog(null)}
        onSave={async (payload) => {
          const ok =
            resourceDialog === "create"
              ? await mutate(
                  "/api/admin/content/resource",
                  "POST",
                  payload,
                  "Resource added",
                )
              : await mutate(
                  `/api/admin/content/resource/${(resourceDialog as Resource).id}`,
                  "PATCH",
                  payload,
                  "Resource updated",
                );
          if (ok) setResourceDialog(null);
        }}
      />

      <BrokerDialog
        open={brokerDialog !== null}
        initial={brokerDialog === "create" ? null : brokerDialog}
        busy={busy}
        onClose={() => setBrokerDialog(null)}
        onSave={async (payload) => {
          const ok =
            brokerDialog === "create"
              ? await mutate(
                  "/api/admin/content/broker",
                  "POST",
                  payload,
                  "Broker added",
                )
              : await mutate(
                  `/api/admin/content/broker/${(brokerDialog as Broker).id}`,
                  "PATCH",
                  payload,
                  "Broker updated",
                );
          if (ok) setBrokerDialog(null);
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the {deleteTarget?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async () => {
                if (!deleteTarget) return;
                const path =
                  deleteTarget.type === "resource"
                    ? `/api/admin/content/resource/${deleteTarget.id}`
                    : `/api/admin/content/broker/${deleteTarget.id}`;
                const ok = await mutate(path, "DELETE", undefined, "Deleted");
                if (ok) setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ResourceDialog({
  open,
  initial,
  steps,
  busy,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Resource | null;
  steps: Step[];
  busy: boolean;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    kind: string;
    externalUrl: string | null;
    relatedStepKeys: string[];
    published: boolean;
  }) => Promise<void>;
}) {
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState("pdf");
  const [externalUrl, setExternalUrl] = React.useState("");
  const [related, setRelated] = React.useState<string[]>([]);
  const [published, setPublished] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setKind(initial?.kind ?? "pdf");
    setExternalUrl(initial?.external_url ?? "");
    setRelated(initial?.related_step_keys ?? []);
    setPublished(initial?.published ?? false);
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit resource" : "Add resource"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Kind</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>External URL</Label>
            <Input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Related steps</Label>
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-neutral-200 p-2">
              {steps.map((s) => {
                const checked = related.includes(s.key);
                return (
                  <label
                    key={s.key}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        setRelated((prev) =>
                          c === true
                            ? [...prev, s.key]
                            : prev.filter((k) => k !== s.key),
                        );
                      }}
                    />
                    {s.title}
                  </label>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={published}
              onCheckedChange={(c) => setPublished(c === true)}
            />
            Published
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="fortuna"
            size="sm"
            disabled={busy || !title.trim()}
            onClick={() =>
              onSave({
                title: title.trim(),
                kind,
                externalUrl: externalUrl.trim() || null,
                relatedStepKeys: related,
                published,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BrokerDialog({
  open,
  initial,
  busy,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Broker | null;
  busy: boolean;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    referralUrl: string | null;
    securePortalUrl: string | null;
  }) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [referralUrl, setReferralUrl] = React.useState("");
  const [securePortalUrl, setSecurePortalUrl] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setReferralUrl(initial?.referral_url ?? "");
    setSecurePortalUrl(initial?.secure_portal_url ?? "");
  }, [open, initial]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit broker" : "Add broker"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Referral URL</Label>
            <Input
              value={referralUrl}
              onChange={(e) => setReferralUrl(e.target.value)}
              className="h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Secure portal URL</Label>
            <Input
              value={securePortalUrl}
              onChange={(e) => setSecurePortalUrl(e.target.value)}
              className="h-8"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="fortuna"
            size="sm"
            disabled={busy || !name.trim()}
            onClick={() =>
              onSave({
                name: name.trim(),
                referralUrl: referralUrl.trim() || null,
                securePortalUrl: securePortalUrl.trim() || null,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
