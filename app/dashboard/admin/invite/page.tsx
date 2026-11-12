import { redirect } from "next/navigation";

export default function AdminInviteRedirectPage() {
  redirect("/dashboard/admin/clients?invite=1");
}
