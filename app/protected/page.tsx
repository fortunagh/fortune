import { redirect } from "next/navigation";

/** @deprecated Use `/dashboard` instead */
export default function ProtectedRedirectPage() {
  redirect("/dashboard");
}
