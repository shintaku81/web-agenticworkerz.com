import Link from "next/link";
import { Zap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <Zap size={13} className="text-white" />
          </span>
          <span className="font-semibold text-slate-800 text-sm tracking-tight">
            Agentic<span className="text-gradient">Workerz</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-5 text-xs text-slate-500">
          <Link href="#" className="hover:text-brand-600 transition-colors">プライバシー</Link>
          <Link href="#" className="hover:text-brand-600 transition-colors">利用規約</Link>
          <Link href="#" className="hover:text-brand-600 transition-colors">お問い合わせ</Link>
        </nav>

        {/* Social */}
        <div className="flex items-center gap-3">
          <Link
            href="https://github.com/shintaku81"
            className="text-slate-400 hover:text-brand-500 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={17} />
          </Link>
          <Link
            href="#"
            className="text-slate-400 hover:text-brand-500 transition-colors"
          >
            <Twitter size={17} />
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        © 2026 AgenticWorkerz. All rights reserved.
      </div>
    </footer>
  );
}
