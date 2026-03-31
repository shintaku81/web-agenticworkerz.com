import Link from "next/link";
import { ArrowRight, Sparkles, Terminal, GitBranch } from "lucide-react";
import AgentSphere from "./AgentSphere";

const badges = [
  { icon: Terminal, label: "Claude Code 活用" },
  { icon: GitBranch, label: "マルチエージェント" },
  { icon: Sparkles, label: "AI駆動開発" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <AgentSphere />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-accent-100/50 blur-3xl animate-pulse-slow pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        {/* Badge row */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {badges.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-100 shadow-sm text-xs font-medium text-brand-700"
            >
              <Icon size={12} className="text-accent-500" />
              {label}
            </span>
          ))}
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
          AIエージェントと人間が
          <br />
          <span className="text-gradient">協働する未来</span>を、今。
        </h1>

        {/* Subtext */}
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          AgenticWorkerz は、AI駆動開発・マルチエージェント活用・自動化ワークフローの
          最前線を発信するメディアです。
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="#articles"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-lg hover:shadow-brand-200 hover:scale-105 transition-all duration-200 text-sm"
          >
            記事を読む
            <ArrowRight size={16} />
          </Link>
          <Link
            href="#newsletter"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:border-brand-200 hover:text-brand-600 transition-all duration-200 text-sm"
          >
            ニュースレター登録
          </Link>
        </div>

        {/* Floating code snippet */}
        <div className="mt-16 mx-auto max-w-xl glass rounded-2xl shadow-xl shadow-brand-100/30 p-4 text-left border border-brand-100/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-300" />
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="w-3 h-3 rounded-full bg-green-300" />
            <span className="ml-2 text-xs text-slate-400 font-mono">agent-workflow.ts</span>
          </div>
          <pre className="text-xs font-mono text-slate-700 leading-relaxed overflow-x-auto">
{`const agent = new AgenticWorker({
  model: "claude-opus-4-6",
  tools: [codeSearch, fileEdit, bash],
});

await agent.run(
  "Issue #42 を自律的に解決して"
);
// → PR を自動作成 ✓`}
          </pre>
        </div>
      </div>
    </section>
  );
}
