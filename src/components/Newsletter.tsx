"use client";
import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "登録に失敗しました。しばらく後でお試しください。");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("ネットワークエラーが発生しました。しばらく後でお試しください。");
    } finally {
      setLoading(false);
    }
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
          <>
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
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/90 border border-white/50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-brand-600 font-semibold text-sm hover:bg-brand-50 transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {loading ? "登録中…" : "登録する"}
              </button>
            </form>

            {error && (
              <div className="mt-3 flex items-center justify-center gap-2 text-red-200 text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </>
        )}

        <p className="mt-4 text-xs text-brand-200">
          スパムは送りません。いつでも解除できます。
        </p>
      </div>
    </section>
  );
}
