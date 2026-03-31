import LegalLayout from "@/components/LegalLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | AgenticWorkerz",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="プライバシーポリシー" updatedAt="2026年3月31日">
      <h2>1. 基本方針</h2>
      <p>
        AgenticWorkerz（以下「当サイト」）は、ユーザーの個人情報の取り扱いについて、以下のポリシーに従います。
        当サイトは個人情報保護の重要性を認識し、適切な管理・保護に努めます。
      </p>

      <h2>2. 収集する情報</h2>
      <p>当サイトは以下の情報を収集することがあります。</p>
      <ul>
        <li><strong>メールアドレス</strong>：ニュースレター購読登録時</li>
        <li><strong>アクセスログ</strong>：IPアドレス、ブラウザ種別、参照元URL、アクセス日時</li>
        <li><strong>Cookie・類似技術</strong>：サイト改善・分析目的</li>
      </ul>

      <h2>3. 利用目的</h2>
      <p>収集した情報は以下の目的にのみ使用します。</p>
      <ul>
        <li>ニュースレターの配信</li>
        <li>サービスの改善・最適化</li>
        <li>統計データの作成（個人を特定しない形式）</li>
        <li>法令に基づく対応</li>
      </ul>

      <h2>4. 第三者提供</h2>
      <p>
        以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません。
      </p>
      <ul>
        <li>ユーザーの事前同意がある場合</li>
        <li>法令に基づく開示が必要な場合</li>
        <li>業務委託先（メール配信サービス等）への提供（秘密保持契約締結済み）</li>
      </ul>

      <h2>5. Cookie の利用</h2>
      <p>
        当サイトではアクセス解析のためにCookieを使用します。
        ブラウザの設定でCookieを無効にすることができますが、一部機能が利用できなくなる場合があります。
      </p>

      <h2>6. ニュースレターの購読解除</h2>
      <p>
        ニュースレターはいつでも解除できます。
        配信メール内の「購読解除」リンクをクリックするか、
        <a href="mailto:info@agenticworkerz.com">info@agenticworkerz.com</a> までご連絡ください。
      </p>

      <h2>7. 個人情報の開示・訂正・削除</h2>
      <p>
        自身の個人情報の開示・訂正・削除を希望される場合は、
        <a href="mailto:info@agenticworkerz.com">info@agenticworkerz.com</a> までお問い合わせください。
        合理的な期間内に対応いたします。
      </p>

      <h2>8. セキュリティ</h2>
      <p>
        個人情報の漏洩・不正アクセス・改ざんを防ぐため、適切な技術的・組織的措置を講じます。
      </p>

      <h2>9. ポリシーの変更</h2>
      <p>
        本ポリシーは予告なく変更することがあります。
        重要な変更がある場合はサイト上でお知らせします。
      </p>

      <h2>10. お問い合わせ</h2>
      <p>
        プライバシーポリシーに関するお問い合わせは{" "}
        <a href="mailto:info@agenticworkerz.com">info@agenticworkerz.com</a> まで。
      </p>
    </LegalLayout>
  );
}
