import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { ARTICLES } from "@/lib/articles";
import AdminLogout from "@/components/AdminLogout";

export default async function AdminArticlesPage() {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← サイトへ
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="font-semibold text-white">Admin — 記事管理</h1>
        </div>
        <AdminLogout />
      </header>

      {/* Articles list */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">記事一覧</h2>
          <span className="text-xs text-slate-500">{ARTICLES.length} 件</span>
        </div>

        <div className="space-y-3">
          {ARTICLES.map((article) => (
            <div
              key={article.slug}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-brand-400 bg-brand-950 px-2 py-0.5 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-500">{article.date}</span>
                  {article.featured && (
                    <span className="text-xs text-accent-400 bg-accent-950 px-2 py-0.5 rounded-full">
                      注目
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-white truncate">{article.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  表示
                </Link>
                <Link
                  href={`/admin/articles/${article.slug}`}
                  className="text-xs text-white bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
