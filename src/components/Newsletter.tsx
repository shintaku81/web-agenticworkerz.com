"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: Supabase 購読者登録 API を呼ぶ
    setSubmitted(true);
  };

  return (
    <section
      id="newsletter"
      className="py-24 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-accent-600" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid-sm opacity-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 max-w-xl mx-auto text-center">
        <span className="inline-block text-xs font-semibold tracking-widest text-accent-200 uppercase mb-4">
          Newsletter
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
          AIワーカーズ通信
        </h2>
        <p className="text-brand-100 mb-8 leading-relaxed">
          週1回、AIエージェント活用・自動化ワークフロー・最新ツール情報をお届けします。
          無料で登録できます。
        </p>

        {submitted ? (
          <div className="glass rounded-2xl p-6 flex items-center justify-center gap-3 text-brand-700 font-medium">
            <CheckCircle2 className="text-green-500" size={20} />
            登録ありがとうございます！次号をお楽しみに。
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/90 border border-white/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={15} />
              登録する
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-brand-200">
          スパムは送りません。いつでも解除できます。
        </p>
      </div>
    </section>
  );
}
