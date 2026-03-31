import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: number;
  date: string;
  gradient: string;
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300 overflow-hidden"
    >
      {/* Color bar */}
      <div className={`h-1.5 bg-gradient-to-r ${article.gradient}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Meta */}
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

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <span className="text-xs text-slate-400">{article.date}</span>
          <ArrowRight
            size={14}
            className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all duration-200"
          />
        </div>
      </div>
    </Link>
  );
}
