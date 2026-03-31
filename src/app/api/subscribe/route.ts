import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // 開発環境用モック
  if (!apiKey) {
    console.warn(
      "[subscribe] RESEND_API_KEY is not set. Returning mock response."
    );
    return NextResponse.json({ success: true });
  }

  if (!audienceId) {
    console.warn(
      "[subscribe] RESEND_AUDIENCE_ID is not set. Returning mock response."
    );
    return NextResponse.json({ success: true });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.contacts.create({
    email,
    audienceId,
    unsubscribed: false,
  });

  if (error) {
    // 409 Conflict = すでに登録済み → 成功扱い
    if ("statusCode" in error && (error as { statusCode: number }).statusCode === 409) {
      return NextResponse.json({ success: true });
    }
    console.error("[subscribe] Resend error:", error);
    return NextResponse.json(
      { error: "登録に失敗しました。しばらく後でお試しください。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
