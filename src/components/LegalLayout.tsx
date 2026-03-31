import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-8"
          >
            <ArrowLeft size={14} /> トップに戻る
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-xs text-slate-400 mb-10">最終更新：{updatedAt}</p>

          <div className="prose prose-slate prose-sm max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
            prose-p:text-slate-600 prose-p:leading-relaxed
            prose-ul:text-slate-600 prose-li:my-1
            prose-strong:text-slate-800
            prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
