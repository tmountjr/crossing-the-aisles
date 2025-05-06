import type { Metadata } from "next";
import Header from "./components/Header";
import siteMetadata from "@/metadata.json";
import { SiteMetadata } from "@/exports/metadata";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.DOMAIN!),
  title: "Crossing the Aisles",
  description: "Visibility into Congressional votes and which lawmakers crossed party lines.",
  openGraph: {
    title: "Crossing the Aisles",
    description: "Visibility into Congressional votes and which lawmakers crossed party lines.",
    url: process.env.DOMAIN,
    siteName: "Crossing the Aisles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    lastUpdate,
    announcements,
  }: SiteMetadata = siteMetadata;
  const lastUpdateDate = new Date(lastUpdate).toISOString();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <Header announcements={announcements}/>

          <main className="flex-grow flex justify-center items-start mt-8">
            <div className="w-full xl:max-w-[1280px] px-4 lg:px-10 mb-[75px]">
              {children}
              <Analytics />
            </div>
          </main>

          <footer className="sticky bottom-0 bg-gray-100 shadow-inner dark:bg-gray-700 dark:text-white flex flex-row justify-end sm:justify-between gap-2 px-10 py-2">
            <p>Last data fetch: {lastUpdateDate}</p>
            <div className="text-center items-center gap-2 flex flex-row justify-end">
              &copy; 2025 CoffeeTech.{" "}
              <Link
                className="underline"
                href="/about#cookie-policy"
                rel="noopener noreferer"
              >
                Cookie Policy
              </Link>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
