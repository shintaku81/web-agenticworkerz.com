import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Users, Wifi, WifiOff } from "lucide-react";
import { EVENTS, getEventStatus, FORMAT_LABELS } from "@/lib/events";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "イベント | AgenticWorkerz",
  description: "AgenticWorkerz 主催のミートアップ・ワークショップ情報",
};

const STATUS_STYLES = {
  upcoming: "bg-green-50 text-green-700 border border-green-100",
  ongoing:  "bg-accent-50 text-accent-700 border border-accent-100",
  ended:    "bg-slate-50 text-slate-500 border border-slate-100",
};
const STATUS_LABELS = { upcoming: "受付中", ongoing: "開催中", ended: "終了" };

const FORMAT_ICONS = {
  online:  Wifi,
  offline: WifiOff,
  hybrid:  Wifi,
};

export default function EventsPage() {
  const upcoming = EVENTS.filter((e) => getEventStatus(e) !== "ended");
  const ended    = EVENTS.filter((e) => getEventStatus(e) === "ended");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-brand-500 transition-colors mb-8">
            <ArrowLeft size={14} /> トップに戻る
          </Link>
          <div className="mb-12">
            <span className="text-xs font-semibold tracking-widest text-brand-500 uppercase block mb-2">Events</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">イベント</h1>
            <p className="text-slate-500">ミートアップ・ワークショップ・ハンズオンを定期開催しています。</p>
          </div>

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="mb-14">
              <h2 className="text-xs font-semibold tracking-widest text-brand-500 uppercase mb-5">Upcoming</h2>
              <div className="flex flex-col gap-4">
                {upcoming.map((event) => {
                  const status = getEventStatus(event);
                  const FormatIcon = FORMAT_ICONS[event.format];
                  return (
                    <Link
                      key={event.slug}
                      href={`/events/${event.slug}`}
                      className="group flex flex-col sm:flex-row gap-0 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-brand-100 transition-all duration-300 overflow-hidden"
                    >
                      {/* Color bar (left on desktop, top on mobile) */}
                      <div className={`sm:w-1.5 h-1.5 sm:h-auto flex-shrink-0 bg-gradient-to-b sm:bg-gradient-to-b from-brand-500 to-accent-500 bg-gradient-to-r`} />
                      <div className="p-5 flex flex-col sm:flex-row gap-4 flex-1">
                        {/* Date block */}
                        <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-center justify-start gap-2 sm:gap-0 sm:w-16">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-brand-600 leading-none">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-xs text-slate-400 font-medium">
                              {new Date(event.date).toLocaleDateString("ja-JP", { month: "short" })}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(event.date).getFullYear()}
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}>
                              {STATUS_LABELS[status]}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <FormatIcon size={11} />
                              {FORMAT_LABELS[event.format]}
                            </span>
                            {event.featured && (
                              <span className="text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">注目</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-brand-600 transition-colors">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Clock size={11} />{event.time}</span>
                            <span className="flex items-center gap-1"><MapPin size={11} />{event.location}</span>
                            {event.capacity && (
                              <span className="flex items-center gap-1"><Users size={11} />定員 {event.capacity}名</span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="self-center flex-shrink-0">
                          <ArrowRight size={16} className="text-slate-200 group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Ended */}
          {ended.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-5">Past Events</h2>
              <div className="flex flex-col gap-3">
                {ended.map((event) => (
                  <Link
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all opacity-60 hover:opacity-80"
                  >
                    <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-600 flex-1 line-clamp-1">{event.title}</span>
                    <span className="text-xs text-slate-400">{event.date}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 border border-brand-100 p-6 text-center">
            <p className="font-medium text-slate-800 mb-1">イベント情報をいち早く受け取る</p>
            <p className="text-sm text-slate-500 mb-4">ニュースレターに登録すると、新しいイベントの告知をメールでお届けします。</p>
            <Link
              href="/#newsletter"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white text-sm font-semibold shadow-sm hover:shadow-brand-200 hover:scale-105 transition-all duration-200"
            >
              無料登録する <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
