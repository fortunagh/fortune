import type { Metadata } from "next";
import { SiteFooter } from "@/components/landing/site-footer";
import { Geist } from "next/font/google";
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
  themeColor: "#ffffff",
  colorScheme: "light",
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
