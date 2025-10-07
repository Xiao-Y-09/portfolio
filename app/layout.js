import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Xiao Yang — Portfolio",
  description: "Architecture & Computer Science projects. Markdown + SSG on Vercel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="border-b p-4 flex justify-between items-center max-w-5xl mx-auto">
          <Link href="/" className="text-lg font-semibold">
            Xiao Yang
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/projects" className="hover:underline">Projects</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <a href="mailto:you@example.com" className="hover:underline">Contact</a>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto p-4">{children}</main>

        <footer className="border-t mt-16 p-4 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Xiao Yang
        </footer>
      </body>
    </html>
  );
}
