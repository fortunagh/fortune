export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh w-full bg-neutral-50 dark:bg-neutral-950">
      {children}
    </div>
  );
}
