import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { ARTICLES } from "@/lib/articles";

// インメモリ上書きストア（サーバー再起動まで有効）
const overrides = new Map<string, Partial<(typeof ARTICLES)[0]>>();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json() as {
    title?: string;
    excerpt?: string;
    content?: string;
    date?: string;
    readTime?: number;
  };

  // バリデーション
  if (body.title !== undefined && body.title.trim() === "") {
    return NextResponse.json({ error: "タイトルは必須です" }, { status: 400 });
  }

  // 上書き内容を保存
  overrides.set(slug, {
    ...overrides.get(slug),
    ...body,
  });

  // ARTICLES 配列をミュータブルに上書き（同一プロセス内で即時反映）
  Object.assign(article, body);

  return NextResponse.json({ ok: true });
}
