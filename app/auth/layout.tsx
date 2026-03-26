import { AuthVaultShell } from "@/components/auth/auth-vault-shell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthVaultShell>{children}</AuthVaultShell>;
}
