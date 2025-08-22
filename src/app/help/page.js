"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "../components/Header";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LockIcon from "@mui/icons-material/Lock";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/Config";
import { useAuthState } from "react-firebase-hooks/auth";

const SUPPORT_EMAIL = "info.kamerlark@gmail.com";
const WHATSAPP_E164 = "+919108553983"; // international format without spaces

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);
  const [user] = useAuthState(auth);
  const [subj, setSubj] = useState("");
  const [desc, setDesc] = useState("");
  const [pref, setPref] = useState("email");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const faqs = useMemo(() => FAQ_ITEMS, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        (typeof f.answer === "string"
          ? f.answer.toLowerCase().includes(q)
          : false)
    );
  }, [faqs, query]);

  // mailto and WhatsApp links are constructed directly in JSX below

  const submitTicket = async (e) => {
    e?.preventDefault?.();
    setErr("");
    setSent(false);
    if (!subj.trim() || !desc.trim()) {
      setErr("Please provide a subject and description.");
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
    } catch (e) {
      setErr(e?.message || "Failed to submit. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14 theme-surface">
        <section className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Help Center</h1>
          <p className="text-sm text-gray-600 mt-2">
            Quick answers, how-tos, and ways to reach us.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search FAQs (e.g., bookings, payments, profile)"
              className="w-full rounded-md border px-3 py-2 text-sm theme-card"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-md border p-4 theme-card">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <EmailIcon fontSize="small" /> Email us
            </div>
            <p className="text-sm text-gray-600 mt-2">
              We reply within 1 business day.
            </p>
            <div className="inline-flex items-center gap-2 mt-3">
              <span className="text-sm font-mono">{SUPPORT_EMAIL}</span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(SUPPORT_EMAIL);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {}
                }}
                className="text-sm rounded-md border px-3 py-2 hover:bg-black hover:text-white transition-colors"
                aria-live="polite"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="rounded-md border p-4 theme-card">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <WhatsAppIcon fontSize="small" /> WhatsApp
            </div>
            <p className="text-sm text-gray-600 mt-2">Chat with support.</p>
            <a
              href={`https://wa.me/${WHATSAPP_E164.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm rounded-md border px-3 py-2 hover:bg-black hover:text-white transition-colors"
            >
              {WHATSAPP_E164}
            </a>
          </div>
          <div className="rounded-md border p-4 theme-card">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <GppGoodIcon fontSize="small" /> Safety & Policies
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Learn how we keep the community safe.
            </p>
            <div className="mt-3 flex gap-2 text-sm flex-wrap">
              <Link href="/privacy" className="underline hover:opacity-80">
                Privacy Policy
              </Link>
              <span className="text-gray-400">•</span>
              <Link href="/terms" className="underline hover:opacity-80">
                Terms of Service
              </Link>
              <span className="text-gray-400">•</span>
              <a
                href="#safety"
                className="underline hover:opacity-80"
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById("safety");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Safety tips
              </a>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <HelpOutlineIcon fontSize="small" /> Frequently Asked Questions
          </h2>
          <div className="rounded-md border theme-card">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-600">No matches.</p>
            ) : (
              filtered.map((item, idx) => (
                <div key={idx} className="border-b last:border-b-0">
                  <button
                    className="w-full text-left px-4 py-3 flex items-center justify-between"
                    onClick={() => setOpen(open === idx ? null : idx)}
                    aria-expanded={open === idx}
                  >
                    <span className="font-medium text-sm">{item.question}</span>
                    <span aria-hidden className="ml-3 text-gray-500">
                      {open === idx ? "−" : "+"}
                    </span>
                  </button>
                  {open === idx ? (
                    <div className="px-4 pb-4 text-sm text-gray-700 whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>

        <section id="safety" className="mb-10">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <LockIcon fontSize="small" /> Safety tips
          </h2>
          <ul className="rounded-md border theme-card list-disc pl-6 py-4 text-sm space-y-2">
            <li>Communicate and pay only on KamerLark channels.</li>
            <li>Never share passwords or one-time codes.</li>
            <li>Verify property details and owner identity before payments.</li>
            <li>Report suspicious behavior using the form below.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <ReportProblemIcon fontSize="small" /> Report an issue
          </h2>
          <div className="rounded-md border theme-card p-4">
            <p className="text-sm text-gray-700">
              Send us details and we’ll investigate.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={submitTicket} className="space-y-3">
                {err ? <p className="text-xs text-red-600">{err}</p> : null}
                {sent ? (
                  <p className="text-xs text-green-700">
                    Ticket submitted. We'll reply by{" "}
                    {pref === "email" ? "email" : "WhatsApp"}.
                  </p>
                ) : null}
                <label className="block text-sm">
                  Subject
                  <input
                    type="text"
                    value={subj}
                    onChange={(e) => setSubj(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Short summary"
                  />
                </label>
                <label className="block text-sm">
                  Description
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    rows={5}
                    placeholder="What happened, steps to reproduce, expected vs actual"
                  />
                </label>
                <div className="flex items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="pref"
                      value="email"
                      checked={pref === "email"}
                      onChange={() => setPref("email")}
                    />
                    Email
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="radio"
                      name="pref"
                      value="whatsapp"
                      checked={pref === "whatsapp"}
                      onChange={() => setPref("whatsapp")}
                    />
                    WhatsApp
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="text-sm rounded-md border px-3 py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  {sending ? "Submitting..." : "Submit ticket"}
                </button>
              </form>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">Or contact us directly:</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    className="text-sm rounded-md border px-3 py-2 hover:bg-black hover:text-white transition-colors"
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                      SUPPORT_EMAIL
                    )}&su=${encodeURIComponent(
                      "Issue Report - KamerLark"
                    )}&body=${encodeURIComponent(
                      `Describe the issue here (steps, expected vs actual):\n\n- Page or feature:\n- Your account email (optional):\n- Screenshots/recording link (optional):\n\nThanks!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Gmail compose with prefilled support email"
                  >
                    Open in Gmail
                  </a>
                  <a
                    className="text-sm rounded-md border px-3 py-2 hover:bg-black hover:text-white transition-colors"
                    href={`https://wa.me/${WHATSAPP_E164.replace(
                      "+",
                      ""
                    )}?text=${encodeURIComponent(
                      "Hi KamerLark Support, I want to report an issue:"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Message on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const FAQ_ITEMS = [
  {
    question: "How do I book a room?",
    answer:
      "Go to Search, open a listing, then use Book Now or Book Appointment. You’ll also open a chat with the owner.",
  },
  {
    question: "How do appointments work?",
    answer:
      "Pick a date/time and appointment type (in-person or virtual). We send you calendar links and notify the owner.",
  },
  {
    question: "What is your cancellation policy?",
    answer:
      "Most bookings can be canceled up to 24 hours before move-in. Some listings may have custom terms in Lease Terms.",
  },
  {
    question: "Payments and security",
    answer:
      "Only pay through official channels. Avoid sharing sensitive info. Contact support if something looks off.",
  },
  {
    question: "How do I contact support?",
    answer: `Email: ${SUPPORT_EMAIL}  |  WhatsApp: ${WHATSAPP_E164}`,
  },
  {
    question: "Can I edit my profile details?",
    answer:
      "Yes. Go to Profile to update name, contact, and preferences. Email changes may require re-authentication.",
  },
  {
    question: "Where are Terms and Privacy?",
    answer: "See links at the top of this page or the site footer.",
  },
];

// 'use client';
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Header from '../components/Header';
// import Spinner from '../components/Spinner'; // Import Spinner

// export default function Component() {
//   const [openIndex, setOpenIndex] = useState(null);
//   const [loading, setLoading] = useState(true); // Loading state

//   const toggleCollapse = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   useEffect(() => {
//     // Simulate a delay to demonstrate the loading spinner
//     const timer = setTimeout(() => {
//       setLoading(false); // Set loading false after the delay
//     }, 1000);

//     return () => clearTimeout(timer); // Clean up the timer
//   }, []);

//   if (loading) {
//     return <Spinner />; // Show spinner when loading
//   }

//   return (
//     <>
//     <Header />

//     <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">

//       <div className="space-y-8">
//         <div className="space-y-4">
//           <p className="text-gray-500 dark:text-gray-400 max-w-[700px]">
//             Welcome to our help and support page. Here you can find answers to frequently asked questions about our room
//             booking services. If you can't find what you're looking for, please don't hesitate to contact us.
//           </p>
//         </div>
//         <div className="space-y-6">
//           <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
//           <div className="space-y-4">
//             {faqItems.map((item, index) => (
//               <div key={index}>
//                 <button
//                   className="flex items-center justify-between w-full bg-gray-300  px-4 py-3 rounded-md"
//                   onClick={() => toggleCollapse(index)}
//                 >
//                   <span className="font-medium">{item.question}</span>
//                   <svg
//                     className={`w-5 h-5 transition-transform ${openIndex === index ? "rotate-90" : ""}`}
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                   </svg>
//                 </button>
//                 <div
//                   className={`px-4 pt-4 text-gray-500 dark:text-gray-400 transition-max-height duration-300 ease-in-out overflow-hidden ${
//                     openIndex === index ? "max-h-screen" : "max-h-0"
//                   }`}
//                 >
//                   {item.answer}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="space-y-6">
//           <h2 className="text-2xl font-bold tracking-tight">Helpful Links</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {helpfulLinks.map((link, index) => (
//               <Link
//                 key={index}
//                 className="flex items-center gap-2 bg-gray-300 px-4 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors"
//                 href={link.href}
//               >
//                 {link.icon}
//                 <span>{link.text}</span>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </main>
//     </>
//   );
// }

// const faqItems = [
//   {
//     question: "How do I book a room?",
//     answer: (
//       <p>
//         To book a room, simply navigate to the "Book a Room" section on our website. You can select your desired
//         dates, number of guests, and room type. Once you've found the perfect room, follow the step-by-step booking
//         process to complete your reservation.
//       </p>
//     ),
//   },
//   {
//     question: "What is your cancellation policy?",
//     answer: (
//       <p>
//         We understand that plans can change, so we offer a flexible cancellation policy. For most bookings, you can
//         cancel up to 24 hours before your scheduled check-in time and receive a full refund. Certain room types or
//         special events may have different cancellation policies, so please check the details of your reservation.
//       </p>
//     ),
//   },
//   {
//     question: "What payment methods do you accept?",
//     answer: (
//       <p>
//         We accept a variety of payment methods, including Visa, Mastercard, American Express, and PayPal. You can
//         securely pay for your booking during the checkout process. If you have any issues with your payment, please
//         don't hesitate to contact our support team.
//       </p>
//     ),
//   },
//   {
//     question: "How can I contact you?",
//     answer: (
//       <p>
//         You can reach our support team in a few different ways:
//         <ul className="list-disc pl-6 mt-2">
//           <li>Email us at support@roombooking.com</li>
//           <li>Call our toll-free number at 1-800-123-4567</li>
//           <li>Chat with us online during business hours</li>
//         </ul>
//         We strive to respond to all inquiries within 1 business day.
//       </p>
//     ),
//   },
// ];

// const helpfulLinks = [
//   { href: "#", text: "About Us", icon: <InfoIcon className="w-5 h-5" /> },
//   { href: "#", text: "Terms of Service", icon: <FileIcon className="w-5 h-5" /> },
//   { href: "#", text: "Privacy Policy", icon: <LockIcon className="w-5 h-5" /> },
//   { href: "#", text: "Contact Us", icon: <MailIcon className="w-5 h-5" /> },
// ];

// function ChevronRightIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M9 18l6-6-6-6" />
//     </svg>
//   );
// }

// function FileIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
//       <path d="M14 2v4a2 2 0 0 0 2 2h4" />
//     </svg>
//   );
// }

// function InfoIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <circle cx="12" cy="12" r="10" />
//       <path d="M12 16v-4" />
//       <path d="M12 8h.01" />
//     </svg>
//   );
// }

// function LockIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
//       <path d="M7 11V7a5 5 0 0 1 10 0v4" />
//     </svg>
//   );
// }

// function MailIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="20" height="16" x="2" y="4" rx="2" />
//       <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
//     </svg>
//   );
// }
