import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { PageTracker } from "@/components/PageTracker";

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "700", "900"],
  display: 'swap',
});

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
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body
        className="bg-[#050505] text-white antialiased selection:bg-[#7C3AED]/30 selection:text-white"
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
