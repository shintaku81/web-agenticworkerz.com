"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "/#features", label: "特徴" },
  { href: "/articles", label: "記事" },
  { href: "/events", label: "イベント" },
  { href: "/#newsletter", label: "ニュースレター" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-sm shadow-brand-100"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-md group-hover:shadow-brand-200 transition-shadow">
            <Zap size={16} className="text-white" />
          </span>
          <span className="font-semibold text-slate-900 tracking-tight">
            Agentic<span className="text-gradient">Workerz</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-600 hover:text-brand-600 transition-colors font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="#newsletter"
            className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white font-medium shadow-md hover:shadow-brand-200 hover:scale-105 transition-all duration-200"
          >
            無料登録
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-600 hover:text-brand-600"
          onClick={() => setOpen(!open)}
          aria-label="メニュー"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-slate-100 px-4 pb-4 pt-2 flex flex-col gap-3">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-700 hover:text-brand-600 font-medium py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="#newsletter"
            className="text-sm text-center px-4 py-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white font-medium mt-1"
            onClick={() => setOpen(false)}
          >
            無料登録
          </Link>
        </div>
      )}
    </header>
  );
}
