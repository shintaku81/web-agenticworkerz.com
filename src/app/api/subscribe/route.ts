import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import nodemailer from "nodemailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

async function sendWelcomeEmail(to: string) {
  const smtpReady =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD;

  if (!smtpReady) {
    console.warn("[subscribe] SMTP not configured. Skipping welcome email.");
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@agenticworkerz.com",
    to,
    subject: "【AgenticWorkerz】ご登録ありがとうございます",
    text: `
AgenticWorkerz ニュースレターへのご登録ありがとうございます。

AIエージェント・自律開発・自動化ワークフローに関する
最新情報をお届けします。

▼ サイトはこちら
https://agenticworkerz.com

配信停止をご希望の場合は、このメールに返信してお知らせください。

──────────────────────────
AgenticWorkerz
https://agenticworkerz.com
    `.trim(),
    html: `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;color:#1e293b;max-width:560px;margin:0 auto;padding:24px">
  <div style="border-top:3px solid #6366f1;padding-top:24px;margin-bottom:24px">
    <h1 style="font-size:20px;font-weight:700;color:#6366f1;margin:0 0 4px">AgenticWorkerz</h1>
    <p style="font-size:12px;color:#94a3b8;margin:0">AI-Driven Workforce Intelligence</p>
  </div>

  <h2 style="font-size:18px;font-weight:600;margin:0 0 16px">ご登録ありがとうございます</h2>

  <p style="font-size:14px;line-height:1.8;color:#475569">
    AgenticWorkerz ニュースレターへのご登録ありがとうございます。<br>
    AIエージェント・自律開発・自動化ワークフローに関する最新情報をお届けします。
  </p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:24px 0">
    <p style="font-size:13px;font-weight:600;color:#6366f1;margin:0 0 8px">最新記事をチェック</p>
    <a href="https://agenticworkerz.com/articles"
       style="font-size:14px;color:#4f46e5;text-decoration:none">
      → agenticworkerz.com/articles
    </a>
  </div>

  <p style="font-size:12px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:16px;margin-top:24px">
    配信停止をご希望の場合は、このメールに返信してお知らせください。<br>
    &copy; 2026 AgenticWorkerz
  </p>
</body>
</html>
    `.trim(),
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body as { email?: string };

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "有効なメールアドレスを入力してください" },
      { status: 400 }
    );
  }

  // Resend で購読者リストに追加
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (apiKey && audienceId) {
    const resend = new Resend(apiKey);
    const { error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });
    if (error) {
      const isConflict =
        "statusCode" in error &&
        (error as { statusCode: number }).statusCode === 409;
      if (!isConflict) {
        console.error("[subscribe] Resend error:", error);
        return NextResponse.json(
          { error: "登録に失敗しました。しばらく後でお試しください。" },
          { status: 500 }
        );
      }
      // 409 = 既登録 → ウェルカムメールはスキップして成功扱い
      return NextResponse.json({ success: true });
    }
  }

  // ウェルカムメール送信（失敗しても登録自体は成功扱い）
  try {
    await sendWelcomeEmail(email);
  } catch (err) {
    console.error("[subscribe] Welcome email failed:", err);
  }

  return NextResponse.json({ success: true });
}
