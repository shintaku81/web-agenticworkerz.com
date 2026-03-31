import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  let body: ContactBody;
  try {
    body = (await req.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  // バリデーション
  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "すべての項目を入力してください" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "有効なメールアドレスを入力してください" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  // 開発環境用モック
  if (!apiKey) {
    console.warn(
      "[contact] RESEND_API_KEY is not set. Returning mock response."
    );
    return NextResponse.json({ success: true });
  }

  const resend = new Resend(apiKey);

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8" /></head>
<body style="font-family: sans-serif; color: #1e293b; background: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    <h2 style="margin: 0 0 24px; font-size: 20px; color: #0f172a;">お問い合わせが届きました</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #64748b; width: 120px; vertical-align: top;">お名前</td>
        <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(name)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top;">メール</td>
        <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(email)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top;">件名</td>
        <td style="padding: 8px 0; font-size: 14px;">${escapeHtml(subject)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; font-size: 13px; color: #64748b; vertical-align: top;">メッセージ</td>
        <td style="padding: 8px 0; font-size: 14px; white-space: pre-wrap;">${escapeHtml(message)}</td>
      </tr>
    </table>
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
      このメールは AgenticWorkerz のお問い合わせフォームから自動送信されました。
    </p>
  </div>
</body>
</html>
  `.trim();

  const { error } = await resend.emails.send({
    from: "AgenticWorkerz <noreply@agenticworkerz.com>",
    to: "info@agenticworkerz.com",
    replyTo: email,
    subject: `[お問い合わせ] ${subject}`,
    html,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json(
      { error: "送信に失敗しました。しばらく後でお試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
