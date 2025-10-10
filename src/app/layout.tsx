import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TRPCProvider } from "@/trpc/client";

import { Readex_Pro } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/query-provider";
import ScrollToTop from "@/components/scroll-to-top";

const readex = Readex_Pro({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s - Tahmidul Photography",
    default: "Tahmidul Photography",
  },
  description: "Tahmidul Photography",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${readex.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <QueryProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </QueryProvider>
          <Toaster />
          <TailwindIndicator />
          <ScrollToTop />
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
