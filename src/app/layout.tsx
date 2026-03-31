import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgenticWorkerz — AI-Driven Workforce Intelligence",
  description: "AIエージェントと人間が協働する次世代ワーク基盤。最新のAI活用事例・ノウハウを発信。",
  openGraph: {
    title: "AgenticWorkerz",
    description: "AIエージェントと人間が協働する次世代ワーク基盤",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
