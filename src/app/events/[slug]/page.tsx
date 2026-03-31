import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, Users, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { EVENTS, getEventBySlug, getEventStatus, FORMAT_LABELS } from "@/lib/events";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return EVENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} | AgenticWorkerz`,
    description: event.description,
  };
}

const STATUS_STYLES = {
  upcoming: "bg-green-50 text-green-700 border border-green-200",
  ongoing:  "bg-accent-50 text-accent-700 border border-accent-200",
  ended:    "bg-slate-100 text-slate-500 border border-slate-200",
};
const STATUS_LABELS = { upcoming: "受付中", ongoing: "開催中", ended: "終了" };

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const status = getEventStatus(event);
  const isActive = status !== "ended";
  const FormatIcon = event.format === "offline" ? WifiOff : Wifi;

  const related = EVENTS.filter((e) => e.slug !== event.slug).slice(0, 2);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-8">
            <ArrowLeft size={14} /> イベント一覧に戻る
          </Link>

          {/* Color bar */}
          <div className={`h-1 rounded-full bg-gradient-to-r ${event.gradient} mb-8`} />

          {/* Status + format */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
              <FormatIcon size={11} />
              {FORMAT_LABELS[event.format]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
            {event.title}
          </h1>

          {/* Description */}
          <p className="text-base text-slate-500 leading-relaxed mb-8 border-l-2 border-brand-200 pl-4">
            {event.description}
          </p>

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 gap-3 mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <Calendar size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 mb-0.5">日時</div>
                <div className="text-sm font-medium text-slate-800">
                  {new Date(event.date).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 mb-0.5">時間</div>
                <div className="text-sm font-medium text-slate-800">{event.time}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs text-slate-400 mb-0.5">場所</div>
                <div className="text-sm font-medium text-slate-800">{event.location}</div>
              </div>
            </div>
            {event.capacity && (
              <div className="flex items-start gap-3">
                <Users size={15} className="text-brand-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">定員</div>
                  <div className="text-sm font-medium text-slate-800">{event.capacity}名</div>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          {isActive && (
            <div className="mb-10">
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white font-semibold shadow-lg hover:shadow-brand-200 hover:scale-105 transition-all duration-200 text-sm"
              >
                <ExternalLink size={14} />
                参加登録する
              </a>
            </div>
          )}

          {/* Body */}
          <div
            className="prose prose-slate prose-sm sm:prose-base max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:text-slate-600 prose-p:leading-relaxed
              prose-ul:text-slate-600 prose-li:my-1
              prose-strong:text-slate-800
              prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: event.body }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-slate-100">
            {event.tags.map((tag) => (
              <span key={tag} className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related events */}
        {related.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-14">
            <h2 className="text-lg font-bold text-slate-900 mb-5">他のイベント</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((e) => (
                <Link
                  key={e.slug}
                  href={`/events/${e.slug}`}
                  className="group block bg-white rounded-xl border border-slate-100 p-4 hover:border-brand-100 hover:shadow-sm transition-all"
                >
                  <div className={`h-1 rounded-full bg-gradient-to-r ${e.gradient} mb-3`} />
                  <p className="text-xs font-medium text-slate-800 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mb-1.5">
                    {e.title}
                  </p>
                  <p className="text-xs text-slate-400">{e.date}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
