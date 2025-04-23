import type { Metadata } from "next";
import Link from "next/link";
import Header from "./components/Header";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faGithubSquare } from "@fortawesome/free-brands-svg-icons";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crossing Party Lines",
  description: "Visibility into Congressional votes and which lawmakers crossed party lines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-grow flex justify-center items-start mt-8">
            <div className="w-full px-10 mb-[75px]">{children}</div>
          </main>

          <footer className="sticky bottom-0 bg-gray-100 shadow-inner dark:bg-gray-700 dark:text-white flex flex-row justify-end items-center gap-2 px-10 py-2">
            <div className="text-center">© 2025 CoffeeTech</div>
            {/* <Link href="https://github.com/tmountjr">
              <FontAwesomeIcon icon={faGithubSquare} className="fa-fw fa-2xl" />
            </Link> */}
          </footer>
        </div>
      </body>
    </html>
  );
}
