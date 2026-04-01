"use client";

import { useState } from "react";
import type { Article } from "@/lib/articles";

interface Props {
  article: Article;
}

export default function ArticleEditor({ article }: Props) {
  const [fields, setFields] = useState({
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    date: article.date,
    readTime: article.readTime,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(key: keyof typeof fields, value: string | number) {
    setFields((prev) => ({ ...prev, [key]: value }));
    if (status === "saved") setStatus("idle");
  }

  async function handleSave() {
    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/articles/${article.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "保存に失敗しました");
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "エラーが発生しました");
      setStatus("error");
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">タイトル</label>
        <input
          type="text"
          value={fields.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">概要（excerpt）</label>
        <textarea
          value={fields.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors resize-y"
        />
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">公開日</label>
          <input
            type="date"
            value={fields.date}
            onChange={(e) => update("date", e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">読了時間（分）</label>
          <input
            type="number"
            value={fields.readTime}
            onChange={(e) => update("readTime", Number(e.target.value))}
            min={1}
            max={60}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Content (HTML) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-400">本文（HTML）</label>
          <span className="text-xs text-slate-600">
            {fields.content.length.toLocaleString()} 文字
          </span>
        </div>
        <textarea
          value={fields.content}
          onChange={(e) => update("content", e.target.value)}
          rows={28}
          spellCheck={false}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-brand-500 transition-colors resize-y"
        />
        <p className="text-xs text-slate-600 mt-1">
          ※ HTML を直接編集します。&lt;h2&gt;, &lt;p&gt;, &lt;pre&gt;&lt;code&gt; などを使ってください。
        </p>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors"
        >
          {status === "saving" ? "保存中..." : "保存する"}
        </button>

        {status === "saved" && (
          <span className="text-sm text-emerald-400">✓ 保存しました</span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-400">{errorMsg}</span>
        )}

        <p className="text-xs text-slate-600 ml-auto">
          ⚠ 保存内容はサーバー再起動まで有効です。恒久的な反映は記事ソースを更新してください。
        </p>
      </div>
    </main>
  );
}
