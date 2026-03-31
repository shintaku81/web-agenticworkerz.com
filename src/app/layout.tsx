import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
