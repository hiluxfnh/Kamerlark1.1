"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/Config";
import { useAuthState } from "react-firebase-hooks/auth";
import ButtonSpinner from "../components/ButtonSpinner";
import { useI18n } from "../lib/i18n";

const SUPPORT_EMAIL = "info.kamerlark@gmail.com";
const WHATSAPP_E164 = "+919108553983";
const WHATSAPP_DISPLAY = "+91 91085 53983";
const WA_LINK = `https://wa.me/${WHATSAPP_E164.replace("+", "")}`;

export default function HelpPage() {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(0);
  const [user] = useAuthState(auth);
  const [subj, setSubj] = useState("");
  const [desc, setDesc] = useState("");
  const [pref, setPref] = useState("email");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  // Build the FAQ from translation keys so it follows the chosen language.
  const FAQ_ITEMS = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        question: t(`faq.q${i + 1}`),
        answer: t(`faq.a${i + 1}`),
      })),
    [lang]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [query, FAQ_ITEMS]);

  const submitTicket = async (e) => {
    e?.preventDefault?.();
    setErr("");
    setSent(false);
    if (!subj.trim() || !desc.trim()) {
      setErr(t("help.errSubjDesc"));
      return;
    }
    try {
      setSending(true);
      await addDoc(collection(db, "supportTickets"), {
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        userEmail: user?.email || null,
        preferredContact: pref,
        subject: subj.trim(),
        description: desc.trim(),
        status: "open",
        page: typeof window !== "undefined" ? window.location.href : "/help",
      });
      setSent(true);
      setSubj("");
      setDesc("");
    } catch (e2) {
      setErr(e2?.message || t("help.submitError"));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="theme-surface min-h-screen pt-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
          {/* Hero + search */}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("help.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("help.subtitle")}
          </p>
          <div className="relative mt-4">
            <SearchIcon
              fontSize="small"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("help.searchPlaceholder")}
              className="w-full rounded-full border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-black"
            />
          </div>

          {/* Contact cards */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <EmailIcon fontSize="small" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{t("help.emailUs")}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {t("help.emailReply")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="truncate text-xs text-gray-700">
                  {SUPPORT_EMAIL}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(SUPPORT_EMAIL);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {}
                  }}
                  className="shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-100"
                >
                  {copied ? t("help.copied") : t("help.copy")}
                </button>
              </div>
            </div>

            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-300"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <WhatsAppIcon fontSize="small" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{t("help.whatsapp")}</p>
              <p className="mt-0.5 text-xs text-gray-500">{t("help.whatsappChat")}</p>
              <p className="mt-3 text-xs font-medium text-emerald-700">
                {WHATSAPP_DISPLAY} →
              </p>
            </a>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <GppGoodIcon fontSize="small" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">
                {t("help.safetyPolicies")}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <Link href="/privacy" className="text-gray-600 underline hover:text-black">
                  {t("footer.privacy")}
                </Link>
                <Link href="/terms" className="text-gray-600 underline hover:text-black">
                  {t("footer.terms")}
                </Link>
                <a
                  href="#safety"
                  className="text-gray-600 underline hover:text-black"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("safety")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {t("help.safetyTips")}
                </a>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="mt-10 text-lg font-semibold text-gray-900">
            {t("help.faqTitle")}
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {filtered.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">
                {t("help.noMatches")}
              </p>
            ) : (
              filtered.map((item, idx) => {
                const isOpen = open === idx;
                return (
                  <div key={item.question} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => setOpen(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {item.question}
                      </span>
                      <KeyboardArrowDownIcon
                        fontSize="small"
                        className={`shrink-0 text-gray-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="whitespace-pre-wrap px-4 pb-4 text-sm leading-relaxed text-gray-600">
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Safety tips */}
          <section id="safety" className="mt-10 scroll-mt-20">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <LockIcon fontSize="small" /> {t("help.stayingSafe")}
            </h2>
            <ul className="mt-3 space-y-2 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
              {[
                t("help.tip1"),
                t("help.tip2"),
                t("help.tip3"),
                t("help.tip4"),
                t("help.tip5"),
              ].map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#082e4d]" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Report an issue */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <ReportProblemIcon fontSize="small" /> {t("help.stillNeedHelp")}
            </h2>
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-5">
              <form onSubmit={submitTicket} className="space-y-3">
                {err ? <p className="text-xs text-red-600">{err}</p> : null}
                {sent ? (
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    {t("help.ticketThanks")}{" "}
                    {pref === "email" ? t("help.byEmail") : t("help.byWhatsapp")}.
                  </div>
                ) : null}
                <input
                  type="text"
                  value={subj}
                  onChange={(e) => setSubj(e.target.value)}
                  placeholder={t("help.subjPlaceholder")}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  placeholder={t("help.descPlaceholder")}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                />
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="text-xs font-medium text-gray-500">
                    {t("help.replyBy")}
                  </span>
                  {["email", "whatsapp"].map((p) => (
                    <label key={p} className="inline-flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="pref"
                        value={p}
                        checked={pref === p}
                        onChange={() => setPref(p)}
                      />
                      {p === "email" ? t("help.email") : t("help.whatsapp")}
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#082e4d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a3a61] disabled:opacity-50"
                  >
                    {sending && <ButtonSpinner />}
                    {sending ? t("help.submitting") : t("help.submitTicket")}
                  </button>
                  <span className="text-xs text-gray-400">{t("help.or")}</span>
                  <a
                    className="rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      SUPPORT_EMAIL
                    )}&su=${encodeURIComponent("Issue Report - KamerLark")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("help.email")}
                  </a>
                  <a
                    className="rounded-full border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    href={`${WA_LINK}?text=${encodeURIComponent(
                      "Hi KamerLark Support, I'd like to report an issue:"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("help.whatsapp")}
                  </a>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
