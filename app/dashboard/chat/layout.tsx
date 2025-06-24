import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Coach - Rooted Platform",
  description: "Conversational AI coach with memory and biometric context",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 