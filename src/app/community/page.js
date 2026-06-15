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
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import Avatar from "../components/Avatar";
import ChatRoomHandler from "../components/ChatRoomHandler";

// Post categories — the things this audience actually comes here to do.
const CATEGORIES = [
  {
    key: "roommate",
    label: "Looking for a roommate",
    short: "Roommate",
    emoji: "🤝",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    key: "room",
    label: "Room available / sublet",
    short: "Room",
    emoji: "🔑",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "market",
    label: "For sale / giveaway",
    short: "Market",
    emoji: "🛋️",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    key: "question",
    label: "Question / advice",
    short: "Question",
    emoji: "💬",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    key: "tip",
    label: "Tip / recommendation",
    short: "Tip",
    emoji: "💡",
    badge: "bg-rose-100 text-rose-700",
  },
];
const catOf = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[3];

const timeAgo = (ts) => {
  try {
    const d = ts?.toDate ? ts.toDate() : ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return "";
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 604800) return `${Math.floor(s / 86400)}d`;
    return d.toLocaleDateString([], { day: "numeric", month: "short" });
  } catch {
    return "";
  }
};

export default function CommunityPage() {
  const router = useRouter();
  const [user, authLoading] = useAuthState(auth);
  const [tab, setTab] = useState("feed"); // 'feed' | 'members'

  // Feed state
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState({
    category: "roommate",
    text: "",
    location: "",
    budget: "",
  });
  const [posting, setPosting] = useState(false);

  // Members state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [following, setFollowing] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);
  const [busyChat, setBusyChat] = useState(null);

  // Gate to signed-in users
  useEffect(() => {
    if (!authLoading && !user) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/community";
      router.push(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [user, authLoading, router]);

  const loadPosts = async () => {
    try {
      const snap = await getDocs(
        query(
          collection(db, "communityPosts"),
          orderBy("createdAt", "desc"),
          limit(60)
        )
      );
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  // Load members + following (for the Members tab)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const snap = await getDocs(collection(db, "Users"));
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setUsersLoading(false);
      }
      try {
        const fs = await getDocs(
          query(collection(db, "Follows"), where("followerId", "==", user.uid))
        );
        setFollowing(fs.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Failed to load following", e);
      }
    })();
  }, [user]);

  const me = useMemo(
    () => users.find((u) => u.id === user?.uid),
    [users, user]
  );

  const submitPost = async () => {
    const text = draft.text.trim();
    if (!user || !text || posting) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "communityPosts"), {
        authorId: user.uid,
        authorName: user.displayName || me?.userName || "Member",
        authorPhoto: user.photoURL || me?.photoURL || "",
        category: draft.category,
        text,
        location: draft.location.trim(),
        university: me?.university || me?.uni || "",
        budget: draft.budget.trim(),
        createdAt: serverTimestamp(),
      });
      setDraft({ category: "roommate", text: "", location: "", budget: "" });
      setComposerOpen(false);
      setPostsLoading(true);
      await loadPosts();
    } catch (e) {
      console.error("Failed to post", e);
      alert("Couldn't share your post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deleteDoc(doc(db, "communityPosts", id));
      setPosts((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const startChat = async (uid) => {
    if (!user) return router.push("/login");
    if (uid === user.uid) return;
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

  const followUser = async (targetId) => {
    if (!user || user.uid === targetId) return;
    setFollowing((f) => [...f, { id: "temp", followingId: targetId }]); // optimistic
    try {
      await addDoc(collection(db, "Follows"), {
        followerId: user.uid,
        followingId: targetId,
        createdAt: serverTimestamp(),
      });
      const snap = await getDocs(
        query(collection(db, "Follows"), where("followerId", "==", user.uid))
      );
      setFollowing(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Failed to follow", e);
    }
  };

  const unfollowUser = async (targetId) => {
    if (!user) return;
    setFollowing((f) => f.filter((x) => x.followingId !== targetId)); // optimistic
    try {
      const snap = await getDocs(
        query(
          collection(db, "Follows"),
          where("followerId", "==", user.uid),
          where("followingId", "==", targetId)
        )
      );
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "Follows", d.id))));
    } catch (e) {
      console.error("Failed to unfollow", e);
    }
  };

  const followingSet = useMemo(() => {
    const s = new Set();
    following.forEach((f) => f.followingId && s.add(f.followingId));
    return s;
  }, [following]);

  const shownPosts = useMemo(
    () =>
      feedFilter === "all"
        ? posts
        : posts.filter((p) => p.category === feedFilter),
    [posts, feedFilter]
  );

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    return users
      .filter((u) => u.id !== user?.uid)
      .filter((u) => {
        if (!q) return true;
        return [u.userName, u.university, u.uni, u.location, u.city]
          .map((x) => String(x || "").toLowerCase())
          .some((x) => x.includes(q));
      });
  }, [users, memberSearch, user]);

  if (!user) return null;

  return (
    <>
      <Header />
      <main className="theme-surface min-h-screen pt-16">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          {/* Hero */}
          <h1 className="text-2xl font-bold tracking-tight">Community</h1>
          <p className="mt-1 text-sm text-gray-500">
            Find a roommate, sublet a room, buy &amp; sell, or ask the locals —
            then message them in one tap.
          </p>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 rounded-full bg-gray-100 p-1 text-sm font-medium">
            {[
              { k: "feed", label: "Feed" },
              { k: "members", label: "Members" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`flex-1 rounded-full py-2 transition-colors ${
                  tab === t.k
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ---------------- FEED ---------------- */}
          {tab === "feed" && (
            <div className="mt-5">
              {/* Composer */}
              <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                {!composerOpen ? (
                  <button
                    onClick={() => setComposerOpen(true)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <Avatar
                      src={user.photoURL}
                      name={user.displayName || user.email}
                      size={40}
                    />
                    <span className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                      Share something with the community…
                    </span>
                  </button>
                ) : (
                  <div>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.key}
                          onClick={() =>
                            setDraft((d) => ({ ...d, category: c.key }))
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            draft.category === c.key
                              ? "bg-[#082e4d] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {c.emoji} {c.short}
                        </button>
                      ))}
                    </div>
                    <textarea
                      autoFocus
                      value={draft.text}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, text: e.target.value }))
                      }
                      rows={3}
                      maxLength={2000}
                      placeholder={
                        draft.category === "roommate"
                          ? "e.g. Looking for a female roommate near Uni of Dschang, move-in September, non-smoker…"
                          : draft.category === "market"
                          ? "e.g. Selling a desk and mini-fridge, great condition, must collect from Biyem-Assi…"
                          : "What would you like to share?"
                      }
                      className="w-full resize-none rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-400"
                    />
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        value={draft.location}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, location: e.target.value }))
                        }
                        placeholder="Area / neighbourhood (optional)"
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                      />
                      {(draft.category === "roommate" ||
                        draft.category === "room") && (
                        <input
                          value={draft.budget}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, budget: e.target.value }))
                          }
                          placeholder="Budget / rent (optional)"
                          className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                        />
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setComposerOpen(false);
                          setDraft({
                            category: "roommate",
                            text: "",
                            location: "",
                            budget: "",
                          });
                        }}
                        className="rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitPost}
                        disabled={!draft.text.trim() || posting}
                        className="rounded-full bg-[#082e4d] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0a3a61] disabled:opacity-40"
                      >
                        {posting ? "Posting…" : "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category filter */}
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {[{ key: "all", short: "All", emoji: "" }, ...CATEGORIES].map(
                  (c) => (
                    <button
                      key={c.key}
                      onClick={() => setFeedFilter(c.key)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        feedFilter === c.key
                          ? "border-[#082e4d] bg-[#082e4d] text-white"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {c.emoji} {c.short}
                    </button>
                  )
                )}
              </div>

              {/* Posts */}
              <div className="mt-4 flex flex-col gap-3">
                {postsLoading ? (
                  <p className="py-10 text-center text-sm text-gray-400">
                    Loading posts…
                  </p>
                ) : shownPosts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      Nothing here yet
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Be the first to post — find a roommate or share a tip.
                    </p>
                  </div>
                ) : (
                  shownPosts.map((p) => {
                    const c = catOf(p.category);
                    const own = p.authorId === user.uid;
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => router.push(`/profile/${p.authorId}`)}
                            className="shrink-0"
                          >
                            <Avatar
                              src={p.authorPhoto}
                              name={p.authorName}
                              size={40}
                            />
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  router.push(`/profile/${p.authorId}`)
                                }
                                className="truncate text-sm font-semibold text-gray-900 hover:underline"
                              >
                                {p.authorName}
                              </button>
                              <span className="text-xs text-gray-400">
                                · {timeAgo(p.createdAt)}
                              </span>
                            </div>
                            <span
                              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${c.badge}`}
                            >
                              {c.emoji} {c.label}
                            </span>
                          </div>
                          {own && (
                            <button
                              onClick={() => deletePost(p.id)}
                              className="shrink-0 text-xs text-gray-400 hover:text-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-800">
                          {p.text}
                        </p>

                        {(p.location || p.budget || p.university) && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {p.location && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                                📍 {p.location}
                              </span>
                            )}
                            {p.budget && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                                💰 {p.budget}
                              </span>
                            )}
                            {p.university && (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                                🎓 {p.university}
                              </span>
                            )}
                          </div>
                        )}

                        {!own && (
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <button
                              onClick={() => startChat(p.authorId)}
                              disabled={busyChat === p.authorId}
                              className="inline-flex items-center gap-1.5 rounded-full bg-[#082e4d] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0a3a61] disabled:opacity-50"
                            >
                              {busyChat === p.authorId
                                ? "Opening…"
                                : "💬 Message"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ---------------- MEMBERS ---------------- */}
          {tab === "members" && (
            <div className="mt-5">
              <input
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search members by name, university or area…"
                className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
              />

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {usersLoading ? (
                  <p className="col-span-full py-10 text-center text-sm text-gray-400">
                    Loading members…
                  </p>
                ) : filteredMembers.length === 0 ? (
                  <p className="col-span-full py-10 text-center text-sm text-gray-400">
                    No members found.
                  </p>
                ) : (
                  filteredMembers.slice(0, visibleCount).map((m) => {
                    const sameUni =
                      me?.university &&
                      (m.university === me.university || m.uni === me.university);
                    const nearby =
                      me?.location && m.location && m.location === me.location;
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm"
                      >
                        <button onClick={() => router.push(`/profile/${m.id}`)}>
                          <Avatar
                            src={m.photoURL}
                            name={m.userName}
                            size={64}
                          />
                        </button>
                        <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-gray-900">
                          {m.userName || "Member"}
                        </h3>
                        <p className="line-clamp-1 text-xs text-gray-500">
                          {m.university || m.uni || "—"}
                        </p>
                        <p className="line-clamp-1 text-xs text-gray-400">
                          {m.location || m.city || ""}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center gap-1">
                          {sameUni && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                              Same university
                            </span>
                          )}
                          {nearby && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                              Nearby
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex w-full gap-2">
                          <button
                            onClick={() => startChat(m.id)}
                            disabled={busyChat === m.id}
                            className="flex-1 rounded-full bg-[#082e4d] py-1.5 text-xs font-semibold text-white hover:bg-[#0a3a61] disabled:opacity-50"
                          >
                            Chat
                          </button>
                          {followingSet.has(m.id) ? (
                            <button
                              onClick={() => unfollowUser(m.id)}
                              className="flex-1 rounded-full border border-gray-300 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Following
                            </button>
                          ) : (
                            <button
                              onClick={() => followUser(m.id)}
                              className="flex-1 rounded-full border border-[#082e4d] py-1.5 text-xs font-semibold text-[#082e4d] hover:bg-[#082e4d]/5"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredMembers.length > visibleCount && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + 24)}
                    className="rounded-full bg-black px-6 py-2 text-sm font-semibold text-white hover:bg-gray-900"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
