import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getArticleBySlug } from "@/lib/articles";
import ArticleEditor from "@/components/ArticleEditor";
import AdminLogout from "@/components/AdminLogout";

export default async function AdminArticleEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session.isAdmin) redirect("/admin/login");

  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← 記事一覧
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-medium truncate max-w-xs">{article.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/articles/${slug}`}
            target="_blank"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
          >
            プレビュー
          </Link>
          <AdminLogout />
        </div>
      </header>

      <ArticleEditor article={article} />
    </div>
  );
}
