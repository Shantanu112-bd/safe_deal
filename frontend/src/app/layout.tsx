import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { PageTracker } from "@/components/PageTracker";

export const metadata: Metadata = {
  title: "SafeDeal — Secure Escrow on Stellar",
  description: "AI-protected escrow for WhatsApp and Instagram commerce. Zero fraud. Instant settlement. Built on Stellar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="bg-[#050505] text-white antialiased selection:bg-[#7C3AED]/30 selection:text-white"
        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <WalletProvider>
            <PageTracker />
            <div className="relative flex min-h-screen flex-col overflow-x-hidden">
              <Navbar />
              <main className="flex-1 relative z-10">{children}</main>
            </div>
            <Toaster position="bottom-right" className="italic-none" />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
