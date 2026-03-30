import type { Metadata, Viewport } from "next";
import { ConditionalSiteFooter } from "@/components/conditional-site-footer";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const siteDescription =
  "Building infinite abundance. A higher standard of access—an exclusive, invitation-only environment for those who expect performance, not promises. Institutional-grade execution, disciplined architecture, and consistency within a private, controlled framework.";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Fortuna",
    template: "%s · Fortuna",
  },
  description: siteDescription,
  applicationName: "Fortuna Global Holdings",
  keywords: [
    "Fortuna",
    "Fortuna Global Holdings",
    "private access",
    "institutional execution",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fortuna Global Holdings",
    title: "Fortuna — Global Holdings",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fortuna — Global Holdings",
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    title: "Fortuna",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ConditionalSiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
