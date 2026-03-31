import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import { ARTICLES, getArticleBySlug } from "@/lib/articles";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | AgenticWorkerz`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = ARTICLES.filter(
    (a) => a.slug !== article.slug && a.category === article.category
  ).slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-8"
          >
            <ArrowLeft size={14} /> 記事一覧に戻る
          </Link>

          {/* Color bar */}
          <div className={`h-1 rounded-full bg-gradient-to-r ${article.gradient} mb-8`} />

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              <Tag size={11} />
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} />
              {article.readTime} min read
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar size={11} />
              {article.date}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base text-slate-500 leading-relaxed mb-8 border-l-2 border-brand-200 pl-4">
            {article.excerpt}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 mb-10 pb-8 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
              {article.author.avatar}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">{article.author.name}</div>
              <div className="text-xs text-slate-400">{article.author.role}</div>
            </div>
          </div>

          {/* Body */}
          <div
            className="prose prose-slate prose-sm sm:prose-base max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
              prose-code:text-brand-700 prose-code:bg-brand-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:shadow-lg
              prose-ul:text-slate-600 prose-li:my-1
              prose-strong:text-slate-800"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-slate-100">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
            <h2 className="text-lg font-bold text-slate-900 mb-5">関連記事</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="group block bg-white rounded-xl border border-slate-100 p-4 hover:border-brand-100 hover:shadow-sm transition-all"
                >
                  <div className={`h-1 rounded-full bg-gradient-to-r ${a.gradient} mb-3`} />
                  <p className="text-xs font-medium text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                    {a.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">{a.readTime} min</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
