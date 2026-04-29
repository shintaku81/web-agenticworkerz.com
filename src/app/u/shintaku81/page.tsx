import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "武市真拓 | AgenticWorkerz",
  description: "集合写真家、ときどきIoTやAIを実装しています",
  openGraph: {
    title: "武市真拓",
    description: "集合写真家、ときどきIoTやAIを実装しています",
    type: "profile",
  },
};

const SNS_LINKS = [
  {
    label: "X (Twitter)",
    href: "https://x.com/shintaku81",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/shintaku81",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com/shintaku81",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/shintaku81",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

const LINKS = [
  {
    label: "AgenticWorkerz — AIと働く未来のメディア",
    href: "https://agenticworkerz.com",
    desc: "AIエージェント時代の働き方を発信",
  },
  {
    label: "集合写真の予約・お問い合わせ",
    href: "https://agenticworkerz.com/contact",
    desc: "イベント・企業の集合写真撮影",
  },
  {
    label: "メールを送る",
    href: "mailto:masahiro@takechi.jp",
    desc: "masahiro@takechi.jp",
  },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-start py-16 px-4">
      {/* Profile Card */}
      <div className="w-full max-w-sm flex flex-col items-center gap-5">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-brand-500/30">
          武
        </div>

        {/* Name & Bio */}
        <div className="text-center">
          <p className="text-xs text-white/40 mb-1 tracking-widest">たけちまさひろ</p>
          <h1 className="text-2xl font-bold tracking-tight">武市 真拓</h1>
          <p className="text-sm text-white/60 mt-1">集合写真家</p>
          <p className="text-sm text-white/50 mt-2 leading-relaxed">
            集合写真家、ときどきIoTやAIを実装しています
          </p>
        </div>

        {/* SNS Icons */}
        <div className="flex gap-4">
          {SNS_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Link Buttons */}
        <div className="w-full flex flex-col gap-3 mt-2">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="w-full rounded-xl bg-white/8 hover:bg-white/14 border border-white/10 hover:border-white/20 px-5 py-4 flex flex-col gap-0.5 transition-all duration-200 group"
            >
              <span className="text-sm font-medium text-white group-hover:text-white/90">
                {link.label}
              </span>
              <span className="text-xs text-white/40">{link.desc}</span>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            AgenticWorkerz
          </Link>
          <p className="text-[10px] text-white/20">
            © 2026 Masahiro Takechi
          </p>
        </div>
      </div>
    </div>
  );
}
