"use client";
import { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API route で送信処理（Resend 連携）
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-8"
          >
            <ArrowLeft size={14} /> トップに戻る
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            お問い合わせ
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            記事の内容・掲載依頼・協業についてはこちらからご連絡ください。
          </p>

          {/* Contact methods */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <a
              href="mailto:info@agenticworkerz.com"
              className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-brand-100 hover:bg-brand-50/30 transition-all group"
            >
              <Mail size={16} className="text-brand-500" />
              <div>
                <div className="text-xs font-medium text-slate-800 group-hover:text-brand-600">メール</div>
                <div className="text-xs text-slate-400">info@agenticworkerz.com</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-brand-100 hover:bg-brand-50/30 transition-all group"
            >
              <MessageSquare size={16} className="text-accent-500" />
              <div>
                <div className="text-xs font-medium text-slate-800 group-hover:text-brand-600">X (Twitter)</div>
                <div className="text-xs text-slate-400">@agenticworkerz</div>
              </div>
            </a>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <CheckCircle2 size={40} className="text-green-400" />
              <p className="font-medium text-slate-800">送信しました。</p>
              <p className="text-sm text-slate-400">通常3営業日以内にご返信いたします。</p>
              <Link href="/" className="mt-4 text-sm text-brand-500 hover:text-brand-600">
                トップに戻る
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    お名前 <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-colors"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    メールアドレス <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  件名 <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-colors"
                  placeholder="記事掲載のご相談"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  メッセージ <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-300 transition-colors resize-none"
                  placeholder="お問い合わせ内容をご記入ください。"
                />
              </div>

              <p className="text-xs text-slate-400">
                送信することで
                <Link href="/privacy" className="text-brand-500 hover:underline mx-1">プライバシーポリシー</Link>
                および
                <Link href="/terms" className="text-brand-500 hover:underline mx-1">利用規約</Link>
                に同意したものとみなします。
              </p>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold text-sm shadow-md hover:shadow-brand-200 hover:scale-[1.01] transition-all duration-200"
              >
                <Send size={15} />
                送信する
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
