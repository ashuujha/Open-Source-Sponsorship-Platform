import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "StellarSponsor - Decentralized Open Source Sponsorship",
  description: "Sponsor open-source projects transparently, securely, and globally on the Stellar network using Soroban smart contracts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg-dark text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <footer className="border-t border-border-dark bg-bg-dark/40 py-6 text-center text-xs text-text-muted">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              &copy; {new Date().getFullYear()} StellarSponsor. Built on Stellar & Soroban. All rights reserved.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
