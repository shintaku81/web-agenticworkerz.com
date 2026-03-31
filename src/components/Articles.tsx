import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { ARTICLES } from "@/lib/articles";

export default function Articles() {
  const featured = ARTICLES.slice(0, 3);

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
          {featured.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300 overflow-hidden"
            >
              <div className={`h-1.5 bg-gradient-to-r ${article.gradient}`} />
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
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-400">{article.date}</span>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
            すべての記事を見る <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
