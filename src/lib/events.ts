// ─────────────────────────────────────────────────────────────
// イベントデータ定義
// Phase B で Strapi REST API 取得に差し替える
// ─────────────────────────────────────────────────────────────

export type EventStatus = "upcoming" | "ongoing" | "ended";
export type EventFormat = "online" | "offline" | "hybrid";

export interface Event {
  slug: string;
  title: string;
  description: string;
  body: string;
  date: string;          // ISO date string
  endDate?: string;
  time: string;          // "19:00 - 21:00"
  location: string;
  format: EventFormat;
  capacity: number | null;
  registrationUrl: string;
  tags: string[];
  gradient: string;
  featured?: boolean;
}

export const EVENTS: Event[] = [
  {
    slug: "agentic-workers-meetup-01",
    title: "AgenticWorkerz Meetup #01 — Claude Code で変わる開発体験",
    description:
      "Claude Code を使った自律コーディングの実例を持ち寄り、知見を共有するミートアップ。初回は少人数でアットホームに開催します。",
    body: `
<h2>開催概要</h2>
<p>AgenticWorkerz 初のオフラインミートアップです。Claude Code・Cursor など AI コーディングツールを実務で使っている方々が集まり、実例ベースで知見を共有します。</p>

<h2>プログラム（予定）</h2>
<ul>
  <li>19:00 開場・ネットワーキング</li>
  <li>19:30 LT①「Claude Code で GitHub Issue を自動解決した話」（15分）</li>
  <li>19:50 LT②「マルチエージェントで受託開発を3倍速にした」（15分）</li>
  <li>20:10 LT③「AIコーディングのガードレール設計」（15分）</li>
  <li>20:30 ディスカッション・Q&A</li>
  <li>21:00 懇親会</li>
</ul>

<h2>参加対象</h2>
<ul>
  <li>AI コーディングツールを実務で使っている・使いたいエンジニア</li>
  <li>自律エージェント開発に興味がある方</li>
  <li>AgenticWorkerz のコミュニティに関心がある方</li>
</ul>

<h2>LT登壇募集</h2>
<p>5〜15分のLTを発表いただける方を募集しています。テーマは AI 活用全般（コーディング・自動化・エージェント設計など）であれば自由です。</p>
    `,
    date: "2026-04-25",
    time: "19:00 - 21:00",
    location: "東京（詳細は参加者に別途連絡）",
    format: "offline",
    capacity: 30,
    registrationUrl: "#newsletter",
    tags: ["Claude Code", "ミートアップ", "LT"],
    gradient: "from-brand-500 to-accent-500",
    featured: true,
  },
  {
    slug: "ai-agent-workshop-01",
    title: "ハンズオン：マルチエージェントシステムを1日で作る",
    description:
      "オーケストレーター + ワーカーパターンのマルチエージェントシステムをハンズオン形式で実装します。Claude API + Python で実際に動くシステムを作ります。",
    body: `
<h2>ワークショップ概要</h2>
<p>朝10時から夕方17時までの集中ワークショップです。マルチエージェントシステムの設計から実装まで、手を動かしながら学びます。</p>

<h2>タイムライン</h2>
<ul>
  <li>10:00 オリエンテーション・環境セットアップ</li>
  <li>10:30 講義：エージェント設計パターン概論</li>
  <li>12:00 ランチ休憩</li>
  <li>13:00 ハンズオン①：オーケストレーター実装</li>
  <li>15:00 ハンズオン②：ワーカーエージェント実装</li>
  <li>16:00 チーム発表・デモ</li>
  <li>17:00 クロージング</li>
</ul>

<h2>前提知識</h2>
<ul>
  <li>Python の基本（関数・クラス程度）</li>
  <li>API の概念（REST API の呼び出し経験）</li>
  <li>Claude API のアカウント（当日でも可）</li>
</ul>
    `,
    date: "2026-05-17",
    time: "10:00 - 17:00",
    location: "オンライン（Zoom）",
    format: "online",
    capacity: 20,
    registrationUrl: "#newsletter",
    tags: ["ワークショップ", "マルチエージェント", "Python"],
    gradient: "from-violet-500 to-brand-400",
    featured: true,
  },
  {
    slug: "agentic-workers-meetup-02",
    title: "AgenticWorkerz Meetup #02 — AI自動化の失敗談と学び",
    description:
      "AI自動化プロジェクトの失敗談・反省点を語り合うミートアップ。うまくいった話よりも、躓いた話から学ぼうというコンセプトです。",
    body: `
<h2>テーマ：失敗から学ぶ AI 自動化</h2>
<p>成功事例ばかりを聞いてもわからない、リアルな躓きポイントを共有します。失敗談・反省点・予想外のトラブルを歓迎します。</p>

<h2>プログラム（予定）</h2>
<ul>
  <li>19:00 開場</li>
  <li>19:30 失敗談 LT × 4〜5本</li>
  <li>20:30 パネルディスカッション「どうすれば失敗を減らせるか」</li>
  <li>21:00 懇親会</li>
</ul>
    `,
    date: "2026-06-12",
    time: "19:00 - 21:00",
    location: "東京（詳細は参加者に別途連絡）",
    format: "offline",
    capacity: 35,
    registrationUrl: "#newsletter",
    tags: ["ミートアップ", "失敗談", "LT"],
    gradient: "from-accent-500 to-sky-400",
  },
];

export function getEventBySlug(slug: string): Event | undefined {
  return EVENTS.find((e) => e.slug === slug);
}

export function getEventStatus(event: Event): EventStatus {
  const now = new Date();
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : start;
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "ongoing";
}

export const FORMAT_LABELS: Record<EventFormat, string> = {
  online: "オンライン",
  offline: "オフライン",
  hybrid: "ハイブリッド",
};
