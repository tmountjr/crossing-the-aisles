import type { Metadata } from "next";
import Header from "@/app/components/Header";
import siteMetadata from "@/metadata.json";
import { Footer } from "@/app/components/Footer";
import { SiteMetadata } from "@/exports/metadata";
import { Analytics } from "@vercel/analytics/react";

import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { lastUpdateDate } from "@/server/actions/lastUpdate";
config.autoAddCss = false;

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
  description:
    "Visibility into Congressional votes and which lawmakers crossed party lines.",
  openGraph: {
    title: "Crossing the Aisles",
    description:
      "Visibility into Congressional votes and which lawmakers crossed party lines.",
    url: process.env.DOMAIN,
    siteName: "Crossing the Aisles",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { announcements }: SiteMetadata = siteMetadata;
  const _lastUpdateDate = await lastUpdateDate();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <Header announcements={announcements} />

          <main className="flex-grow flex justify-center items-start mt-8">
            <div className="w-full xl:max-w-[1280px] px-4 lg:px-10 mb-[75px]">
              {children}
              <Analytics />
            </div>
          </main>

          <Footer updateDate={_lastUpdateDate} />
        </div>
      </body>
    </html>
  );
}
