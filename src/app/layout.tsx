import type { Metadata } from "next";
import { IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-serif",
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
    <html lang="en" className={`${ibmPlexSerif.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg-dark text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <footer className="border-t border-neutral-900 bg-[#070709] py-8 text-center text-xs text-neutral-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              &copy; {new Date().getFullYear()} StellarSponsor. Built on Stellar & Soroban. All rights reserved.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
