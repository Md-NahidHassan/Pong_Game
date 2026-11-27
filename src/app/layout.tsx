import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEON PONG — The Ultimate Arcade Experience",
  description:
    "A futuristic neon arcade Pong game built with Next.js, TypeScript, Tailwind CSS, and HTML5 Canvas. Play Single Player vs Predictive AI or Local Two Player.",
  keywords: ["Neon Pong", "Arcade Game", "Pong", "Next.js", "HTML5 Canvas"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#030612",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-[#030612] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
