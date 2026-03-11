// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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

const NAV_LINKS = [
  { href: "/roster",        label: "Roster",        icon: "👤" },
  { href: "/shows",         label: "Shows",         icon: "📺" },
  { href: "/championships", label: "Championships", icon: "🏆" },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 min-h-screen`}>
        <div className="flex min-h-screen">

          {/* Sidebar */}
          <aside className="w-56 shrink-0 fixed top-0 left-0 h-screen bg-gray-800 border-r border-gray-700 flex flex-col z-30">

            {/* Logo */}
            <div className="px-5 py-5 border-b border-gray-700">
              <Link href="/" className="block">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Wrestling</div>
                <div className="text-lg font-bold text-white leading-tight">Booker</div>
              </Link>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition group"
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Settings at bottom */}
            <div className="px-3 py-4 border-t border-gray-700">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition"
              >
                <span className="text-base">⚙️</span>
                <span className="text-sm font-medium">Settings</span>
              </Link>
            </div>
          </aside>

          {/* Main content — offset by sidebar width */}
          <main className="ml-56 flex-1 min-h-screen pt-8">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}