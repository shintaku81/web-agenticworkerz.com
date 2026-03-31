import { NextRequest, NextResponse } from "next/server";

/**
 * Vercel Cron Job エンドポイント
 * スケジュール: 毎日 03:00 UTC (vercel.json 参照)
 *
 * 将来の AI 改善ループ用スタブ実装
 * - 低成果コンテンツの検出
 * - タイトル・CTA の改善案を AI で生成
 * - Supabase の ai_outputs テーブルに保存
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // CRON_SECRET による認証
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.log("[ai-improve] CRON_SECRET is not configured — skipping auth check in development");
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    console.log("[ai-improve] Unauthorized request — invalid CRON_SECRET");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  console.log(`[ai-improve] Cron job started at ${startedAt}`);

  try {
    // ─────────────────────────────────────────────────────────────
    // TODO (Phase B): 実装予定の処理
    // 1. Supabase から content_performance_daily を取得
    // 2. CTR / 滞在時間が基準値を下回る記事を抽出
    // 3. Claude API で改善提案（タイトル・CTA）を生成
    // 4. Supabase の ai_outputs テーブルに保存
    // ─────────────────────────────────────────────────────────────

    console.log("[ai-improve] Stub: no-op — Phase B implementation pending");

    const completedAt = new Date().toISOString();
    console.log(`[ai-improve] Cron job completed at ${completedAt}`);

    return NextResponse.json({
      ok: true,
      startedAt,
      completedAt,
      message: "AI improve cron job completed (stub)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[ai-improve] Cron job failed: ${message}`);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
