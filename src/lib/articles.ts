// ─────────────────────────────────────────────────────────────
// 記事データ定義
// Phase B で Strapi REST API 取得に差し替える
// ─────────────────────────────────────────────────────────────

export type Category =
  | "アーキテクチャ"
  | "開発ワークフロー"
  | "AI自動化"
  | "ツール"
  | "事例"
  | "基礎知識";

export interface Author {
  name: string;
  role: string;
  avatar: string; // initials fallback
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML string (Strapi では richtext → html)
  category: Category;
  tags: string[];
  author: Author;
  readTime: number;
  date: string;
  gradient: string;
  featured?: boolean;
}

export const ARTICLES: Article[] = [
  {
    slug: "multi-agent-architecture",
    title: "マルチエージェントアーキテクチャ設計：オーケストレーターとワーカーの分離",
    excerpt:
      "複数のAIエージェントが協調して動くシステムを設計する際の責務分離パターン。Aira・Kiki・Haruを例に実践的な設計手法を解説します。",
    content: `
<h2>なぜマルチエージェントが必要か</h2>
<p>単一のAIエージェントに複雑なタスクを任せると、コンテキストウィンドウの限界・専門性の欠如・エラー伝播などの問題が発生します。マルチエージェント設計はこれらを解決します。</p>

<h2>オーケストレーター / ワーカー パターン</h2>
<p>最も基本的なパターンは「指揮者（オーケストレーター）」と「実行者（ワーカー）」の分離です。</p>
<ul>
  <li><strong>Aira（オーケストレーター）</strong>：タスクを受け取り、分解し、適切なワーカーに委譲する</li>
  <li><strong>Kiki（モニター）</strong>：システム全体の健全性を監視する</li>
  <li><strong>Haru（Reranker）</strong>：検索結果の品質評価に特化する</li>
</ul>

<h2>実装の要点</h2>
<p>各エージェントは明確に定義された入出力インターフェースを持ち、他のエージェントの実装詳細を知らなくてよい設計にします。これにより独立したアップグレードとテストが可能になります。</p>

<pre><code>// オーケストレーターの基本構造
const orchestrator = new Agent({
  model: "claude-opus-4-6",
  systemPrompt: "タスクを受け取り、専門エージェントに委譲せよ",
  tools: [delegateToWorker, monitorProgress, collectResults],
});</code></pre>
    `,
    category: "アーキテクチャ",
    tags: ["マルチエージェント", "設計", "Claude"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 8,
    date: "2026-03-28",
    gradient: "from-brand-500 to-accent-500",
    featured: true,
  },
  {
    slug: "claude-code-autonomous-dev",
    title: "Claude Code で実現する自律コーディング：Issue → PR を全自動で",
    excerpt:
      "GitHub Issue を受け取り、コードを書き、テストを走らせ、PR を作成するまでをClaude Codeが完全自律で行うワークフローの構築方法。",
    content: `
<h2>自律コーディングとは</h2>
<p>Claude Code の自律コーディングとは、人間が Issue を書くだけで、コードの修正・テスト実行・PR 作成までを AI が完全に担うフローです。</p>

<h2>セットアップ</h2>
<p>GitHub Actions + Claude Code CLI を組み合わせることで、Issue に特定ラベルを付けるだけでワークフローが起動します。</p>

<pre><code># .github/workflows/ai-dev.yml
on:
  issues:
    types: [labeled]
jobs:
  claude-fix:
    if: contains(github.event.label.name, 'ai-fix')
    steps:
      - uses: actions/checkout@v4
      - run: claude -p "Issue #&#36;&#123;&#123; github.event.issue.number &#125;&#125; を修正してPRを作成"</code></pre>

<h2>成果</h2>
<p>定型的なバグ修正・リファクタリング・ドキュメント更新の約60%を自動化できました。人間は最終レビューに集中できます。</p>
    `,
    category: "開発ワークフロー",
    tags: ["Claude Code", "GitHub Actions", "自動化"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 12,
    date: "2026-03-25",
    gradient: "from-violet-500 to-brand-400",
    featured: true,
  },
  {
    slug: "supabase-ai-loop",
    title: "Supabase × AI改善ループ：コンテンツパフォーマンスを自動最適化する",
    excerpt:
      "記事のCTR・滞在時間をSupabaseで収集し、低成果コンテンツをAIが検出してタイトル・CTAの改善案を自動生成するパイプラインの実装。",
    content: `
<h2>コンテンツ改善ループの全体像</h2>
<p>データ収集 → 分析 → AI提案 → 人間承認 → 反映 → 計測 のサイクルを自動化します。</p>

<h2>Supabase でのデータ設計</h2>
<p>content_performance_daily テーブルに記事ごとの日次指標を蓄積します。</p>

<pre><code>create table content_performance_daily (
  id uuid primary key default gen_random_uuid(),
  article_slug text not null,
  date date not null,
  page_views int default 0,
  avg_time_on_page int default 0,
  ctr_from_list numeric(5,4) default 0,
  scroll_depth_avg numeric(5,2) default 0
);</code></pre>

<h2>AI改善提案の生成</h2>
<p>Vercel Cron Job が毎朝低成果記事を抽出し、Claude API で改善案を生成。Supabase の ai_outputs テーブルに保存後、管理者が承認します。</p>
    `,
    category: "AI自動化",
    tags: ["Supabase", "AI", "コンテンツ最適化"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 10,
    date: "2026-03-20",
    gradient: "from-accent-500 to-sky-400",
  },
  {
    slug: "strapi-nextjs-setup",
    title: "Strapi v5 + Next.js 15 セットアップ完全ガイド",
    excerpt:
      "Strapi を Docker で立ち上げ、Next.js から REST API で記事データを取得するまでの手順をステップバイステップで解説します。",
    content: `
<h2>構成概要</h2>
<p>Strapi（コンテンツ管理）と Next.js（フロントエンド）を分離して運用します。Strapi は Docker で DEV/STG サーバーに常駐させます。</p>

<h2>Docker Compose 設定</h2>
<pre><code>version: "3.8"
services:
  strapi:
    image: node:20-alpine
    working_dir: /app
    volumes: ["./strapi:/app"]
    ports: ["1337:1337"]
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_URL: \${DATABASE_URL}
    command: npm run develop</code></pre>

<h2>Next.js からの取得</h2>
<pre><code>// lib/strapi.ts
export async function getArticles() {
  const res = await fetch(
    \`\${process.env.STRAPI_URL}/api/articles?populate=*\`,
    { next: { revalidate: 60 } }
  );
  return res.json();
}</code></pre>
    `,
    category: "ツール",
    tags: ["Strapi", "Next.js", "Docker"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 15,
    date: "2026-03-15",
    gradient: "from-emerald-500 to-accent-400",
  },
  {
    slug: "ai-agent-patterns-2026",
    title: "2026年版：AIエージェント設計パターン5選",
    excerpt:
      "ReAct・Plan-and-Execute・Reflection・Tool Use・Multi-Agent の各パターンを実装例とともに整理。どのパターンをいつ使うかの判断基準も解説します。",
    content: `
<h2>パターン 1: ReAct（推論 + 行動）</h2>
<p>思考（Thought）→ 行動（Action）→ 観察（Observation）を繰り返す最も基本的なエージェントパターンです。</p>

<h2>パターン 2: Plan-and-Execute</h2>
<p>まず全体計画を立て、それに従って順次実行します。長期タスクに向いています。</p>

<h2>パターン 3: Reflection</h2>
<p>生成した出力を自己評価し、品質が基準を下回る場合は再生成します。コンテンツ品質担保に有効です。</p>

<h2>パターン 4: Tool Use</h2>
<p>外部ツール（Web検索・コード実行・DB参照）を呼び出して情報を補完します。Claude の function calling が基盤です。</p>

<h2>パターン 5: Multi-Agent</h2>
<p>専門エージェントを並列実行してオーケストレーターが統合します。複雑タスクの高速化に最適です。</p>
    `,
    category: "基礎知識",
    tags: ["エージェント", "設計パターン", "ReAct"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 11,
    date: "2026-03-10",
    gradient: "from-brand-400 to-violet-500",
  },
  {
    slug: "newsletter-resend-setup",
    title: "Resend + Supabase でニュースレター基盤を作る",
    excerpt:
      "購読者管理を Supabase、配信を Resend で担うシンプルなニュースレター基盤の構築方法。ダブルオプトイン・配信停止・セグメント管理まで対応します。",
    content: `
<h2>なぜ Resend か</h2>
<p>開発者向けに設計されたメール配信 API です。Next.js との親和性が高く、React でメールテンプレートを書けます（React Email）。</p>

<h2>購読フロー</h2>
<ol>
  <li>ユーザーがフォームでメールアドレスを入力</li>
  <li>Supabase の subscribers テーブルに pending で保存</li>
  <li>Resend で確認メールを送信</li>
  <li>確認リンクをクリックで confirmed に更新</li>
</ol>

<h2>配信実装</h2>
<pre><code>import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "news@agenticworkerz.com",
  to: subscriberEmails,
  subject: "AIワーカーズ通信 #12",
  react: NewsletterTemplate({ content }),
});</code></pre>
    `,
    category: "ツール",
    tags: ["Resend", "メルマガ", "Supabase"],
    author: { name: "Shintaku", role: "AI Architect", avatar: "S" },
    readTime: 9,
    date: "2026-03-05",
    gradient: "from-sky-500 to-brand-400",
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Category): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

export const ALL_CATEGORIES: Category[] = [
  "アーキテクチャ",
  "開発ワークフロー",
  "AI自動化",
  "ツール",
  "事例",
  "基礎知識",
];
