import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "SafeDeal | Secure Escrow Payments",
  description: "The trusted middleman for WhatsApp and Instagram commerce.",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <WalletProvider>
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
              {/* Attractive Background Glow Effects */}
              <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/30 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-500/30 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-[40%] left-[80%] h-[30%] w-[30%] rounded-full bg-emerald-500/20 blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
              </div>
              
              <div className="relative z-10 flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 relative">{children}</main>
              </div>
            </div>
            <Toaster position="bottom-right" className="italic-none" />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
