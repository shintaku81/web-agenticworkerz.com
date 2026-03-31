import Link from "next/link";
import { ArrowLeft, Tag, Clock } from "lucide-react";
import { ARTICLES, ALL_CATEGORIES, type Category } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "記事一覧 | AgenticWorkerz",
  description: "AIエージェント・自律開発・自動化ワークフローに関する記事",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category as Category | undefined;
  const articles = activeCategory
    ? ARTICLES.filter((a) => a.category === activeCategory)
    : ARTICLES;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Page header */}
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-6"
            >
              <ArrowLeft size={14} /> トップに戻る
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
              記事一覧
            </h1>
            <p className="text-slate-500">
              AIエージェント・自律開発・自動化に関する実践的な知識を発信しています。
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/articles"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !activeCategory
                  ? "bg-brand-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              }`}
            >
              すべて ({ARTICLES.length})
            </Link>
            {ALL_CATEGORIES.map((cat) => {
              const count = ARTICLES.filter((a) => a.category === cat).length;
              if (count === 0) return null;
              return (
                <Link
                  key={cat}
                  href={`/articles?category=${encodeURIComponent(cat)}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                  }`}
                >
                  {cat} ({count})
                </Link>
              );
            })}
          </div>

          {/* Articles grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300 overflow-hidden"
              >
                {article.coverImage ? (
                  <div className="overflow-hidden bg-slate-900" style={{ height: "140px" }}>
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className={`h-1.5 bg-gradient-to-r ${article.gradient}`} />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      <Tag size={10} />
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={10} />
                      {article.readTime} min
                    </span>
                    {article.featured && (
                      <span className="text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">
                        注目
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                        {article.author.avatar}
                      </span>
                      <span className="text-xs text-slate-400">{article.date}</span>
                    </div>
                    <span className="text-xs text-slate-300 group-hover:text-brand-400 transition-colors">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
