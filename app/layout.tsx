import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "The ROOTED Way - Hybrid AI-Human Wellness Coaching",
  description: "The future of hybrid AI-Human wellness coaching - A community wellness platform focused on the 6 pillars: Breathing, Sleep, Nutrition, Movement, Mindset, and Relaxation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
