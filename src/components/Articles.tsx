import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ArticleCard, { type Article } from "./ArticleCard";

const SAMPLE_ARTICLES: Article[] = [
  {
    slug: "multi-agent-architecture",
    title: "マルチエージェントアーキテクチャ設計：オーケストレーターとワーカーの分離",
    excerpt:
      "複数のAIエージェントが協調して動くシステムを設計する際の責務分離パターン。Aira・Kiki・Haruを例に実践的な設計手法を解説します。",
    category: "アーキテクチャ",
    readTime: 8,
    date: "2026-03-28",
    gradient: "from-brand-500 to-accent-500",
  },
  {
    slug: "claude-code-autonomous-dev",
    title: "Claude Code で実現する自律コーディング：Issue → PR を全自動で",
    excerpt:
      "GitHub Issue を受け取り、コードを書き、テストを走らせ、PR を作成するまでをClaude Codeが完全自律で行うワークフローの構築方法。",
    category: "開発ワークフロー",
    readTime: 12,
    date: "2026-03-25",
    gradient: "from-violet-500 to-brand-400",
  },
  {
    slug: "supabase-ai-loop",
    title: "Supabase × AI改善ループ：コンテンツパフォーマンスを自動最適化する",
    excerpt:
      "記事のCTR・滞在時間をSupabaseで収集し、低成果コンテンツをAIが検出してタイトル・CTAの改善案を自動生成するパイプラインの実装。",
    category: "AI自動化",
    readTime: 10,
    date: "2026-03-20",
    gradient: "from-accent-500 to-sky-400",
  },
];

export default function Articles() {
  return (
    <section id="articles" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-500 uppercase block mb-2">
              Latest Articles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              最新記事
            </h2>
          </div>
          <Link
            href="/articles"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            すべて見る <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_ARTICLES.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600"
          >
            すべての記事を見る <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
