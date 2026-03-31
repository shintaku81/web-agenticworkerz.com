import { Bot, Layers, Rocket, FlaskConical, Rss, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "マルチエージェント設計",
    desc: "複数のAIエージェントが分業・連携する設計パターンを実例で解説します。",
    color: "from-brand-500 to-brand-400",
  },
  {
    icon: Layers,
    title: "AI駆動開発ワークフロー",
    desc: "Claude Code・Cursor を使った実践的な自律開発フローを紹介します。",
    color: "from-accent-500 to-accent-400",
  },
  {
    icon: Rocket,
    title: "プロダクト高速化",
    desc: "AIで企画・設計・実装・テストを加速させる具体的な手法を共有します。",
    color: "from-violet-500 to-brand-500",
  },
  {
    icon: FlaskConical,
    title: "実験と検証",
    desc: "A/Bテスト・成果計測・改善ループをAIで最適化するフレームワークです。",
    color: "from-sky-500 to-accent-500",
  },
  {
    icon: Rss,
    title: "ニュースレター",
    desc: "週1回、厳選したAI活用ノウハウ・事例・ツール情報をお届けします。",
    color: "from-brand-400 to-accent-500",
  },
  {
    icon: ShieldCheck,
    title: "安全な自動化設計",
    desc: "人間とAIの責務分担・承認フロー・ガードレール設計の実践知を発信します。",
    color: "from-emerald-500 to-accent-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-50/30 to-white pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-500 uppercase mb-3">
            What We Cover
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            AIと働く技術を、<span className="text-gradient">体系的に</span>学ぶ
          </h2>
          <p className="mt-4 text-slate-500 max-w-xl mx-auto">
            実務で使えるAI活用の知識・実装パターン・事例を網羅的にカバーします。
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-sm">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
