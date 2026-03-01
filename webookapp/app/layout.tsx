// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
// @ts-expect-error - CSS module types not available
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wrestling Booker",
  description: "Wrestling booking simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 min-h-screen`}
      >
        {/* Navigation */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="text-xl font-bold text-white hover:text-blue-400 transition"
              >
                Wrestling Booker
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/roster" className="text-gray-300 hover:text-white transition">
                  Roster
                </Link>
                <Link href="/shows" className="text-gray-300 hover:text-white transition">
                  Shows
                </Link>
                <Link href="/championships" className="text-gray-300 hover:text-white transition">
                  Championships
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}