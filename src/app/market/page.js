"use client";
import Header from "../components/Header";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase/Config";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import Avatar from "../components/Avatar";
import ChatRoomHandler from "../components/ChatRoomHandler";
import { useI18n } from "../lib/i18n";

const timeAgo = (ts) => {
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return "";
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return d.toLocaleDateString([], { day: "numeric", month: "short" });
  } catch {
    return "";
  }
};

export default function MarketPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({ text: "", price: "", location: "" });
  const [posting, setPosting] = useState(false);
  const [busyChat, setBusyChat] = useState(null);
  const [me, setMe] = useState(null);

  // Gate to signed-in users (same model as community)
  useEffect(() => {
    if (!authLoading && !user) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/market";
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, authLoading, router]);

  const load = async () => {
    try {
      // Query market-category posts. Order client-side to avoid needing a
      // composite index on (category, createdAt).
      const snap = await getDocs(
        query(
          collection(db, "communityPosts"),
          where("category", "==", "market"),
          limit(100)
        )
      );
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
        );
      setItems(rows);
    } catch (e) {
      console.error("Failed to load market", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      load();
      (async () => {
        try {
          const s = await getDocs(
            query(collection(db, "Users"), where("__name__", "==", user.uid))
          );
          setMe(s.docs[0]?.data() || null);
        } catch {}
      })();
    }
  }, [user]);

  const submit = async () => {
    const text = draft.text.trim();
    if (!user || !text || posting) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "communityPosts"), {
        authorId: user.uid,
        authorName: user.displayName || me?.userName || "Member",
        authorPhoto: user.photoURL || me?.photoURL || "",
        category: "market",
        text,
        budget: draft.price.trim(),
        location: draft.location.trim(),
        university: me?.university || me?.uni || "",
        available: true,
        createdAt: serverTimestamp(),
      });
      setDraft({ text: "", price: "", location: "" });
      setComposerOpen(false);
      setLoading(true);
      await load();
    } catch (e) {
      console.error("Failed to post item", e);
      alert(t("market.postError"));
    } finally {
      setPosting(false);
    }
  };

  const toggleAvailable = async (item) => {
    const next = item.available === false;
    setItems((p) =>
      p.map((x) => (x.id === item.id ? { ...x, available: next } : x))
    );
    try {
      await updateDoc(doc(db, "communityPosts", item.id), { available: next });
    } catch (e) {
      console.error("Failed to update item", e);
      setItems((p) =>
        p.map((x) => (x.id === item.id ? { ...x, available: !next } : x))
      );
    }
  };

  const remove = async (id) => {
    if (!confirm(t("community.deleteConfirm"))) return;
    try {
      await deleteDoc(doc(db, "communityPosts", id));
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      console.error("Failed to delete item", e);
    }
  };

  const startChat = async (uid) => {
    if (!user || uid === user.uid) return;
    setBusyChat(uid);
    try {
      const roomId = await ChatRoomHandler({ userId1: user.uid, userId2: uid });
      if (roomId) router.push(`/chat/messagecenter?roomId=${roomId}`);
    } catch (e) {
      console.error("Failed to start chat", e);
    } finally {
      setBusyChat(null);
    }
  };

  const shown = useMemo(
    () => (availableOnly ? items.filter((i) => i.available !== false) : items),
    [items, availableOnly]
  );

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="theme-surface min-h-screen pt-16">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
          {/* Hero */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                🛍️ {t("market.title")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{t("market.subtitle")}</p>
            </div>
            <button
              onClick={() => setComposerOpen((v) => !v)}
              className="rounded-full bg-[#082e4d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a3a61]"
            >
              + {t("market.sell")}
            </button>
          </div>

          {/* Composer */}
          {composerOpen && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <textarea
                autoFocus
                value={draft.text}
                onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                rows={3}
                maxLength={2000}
                placeholder={t("market.whatSelling")}
                className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
              />
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  placeholder={t("market.priceOptional")}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
                <input
                  value={draft.location}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, location: e.target.value }))
                  }
                  placeholder={t("market.pickupOptional")}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setComposerOpen(false);
                    setDraft({ text: "", price: "", location: "" });
                  }}
                  className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={submit}
                  disabled={!draft.text.trim() || posting}
                  className="rounded-full bg-[#082e4d] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0a3a61] disabled:opacity-40"
                >
                  {posting ? t("market.posting") : t("market.post")}
                </button>
              </div>
            </div>
          )}

          {/* Filter */}
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            {t("market.availableOnly")}
          </label>

          {/* Grid */}
          <div className="mt-4">
            {loading ? (
              <p className="py-10 text-center text-sm text-gray-400">
                {t("community.loadingPosts")}
              </p>
            ) : shown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 py-12 text-center">
                <p className="text-sm font-medium text-gray-600">
                  {t("market.empty")}
                </p>
                <p className="mt-1 text-xs text-gray-400">{t("market.beFirst")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((p) => {
                  const own = p.authorId === user.uid;
                  const taken = p.available === false;
                  return (
                    <div
                      key={p.id}
                      className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${
                        taken ? "border-gray-200 opacity-75" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/profile/${p.authorId}`)}>
                          <Avatar src={p.authorPhoto} name={p.authorName} size={32} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {p.authorName}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {timeAgo(p.createdAt)}
                          </p>
                        </div>
                        {taken && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                            {t("community.takenBadge")}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-800">
                        {p.text}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
                          💰 {p.budget?.trim() ? p.budget : t("market.free")}
                        </span>
                        {p.location && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                            📍 {p.location}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 border-t border-gray-100 pt-3">
                        {own ? (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleAvailable(p)}
                              className="text-xs font-medium text-[#082e4d] hover:underline"
                            >
                              {taken
                                ? t("community.markAvailable")
                                : t("community.markTaken")}
                            </button>
                            <button
                              onClick={() => remove(p.id)}
                              className="text-xs text-gray-400 hover:text-red-600"
                            >
                              {t("community.delete")}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startChat(p.authorId)}
                            disabled={busyChat === p.authorId || taken}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#082e4d] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0a3a61] disabled:opacity-50"
                          >
                            {busyChat === p.authorId
                              ? t("community.opening")
                              : t("community.message")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
