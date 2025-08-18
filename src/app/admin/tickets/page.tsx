"use client";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase/Config";
import { addDoc, collection, doc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getIdTokenResult } from "firebase/auth";

// Replace with your own UID(s)
const ADMIN_UIDS = new Set<string>([
  // Replace with your admin UID(s)
  "lylD7vRHkUX55xP4ofqJA9yDqFF3",
]);

type Ticket = {
  id: string;
  subject: string;
  description: string;
  userId?: string | null;
  userEmail?: string | null;
  preferredContact?: "email" | "whatsapp" | string;
  status?: "open" | "in_progress" | "closed" | string;
  createdAt?: any;
  page?: string;
};

type TicketNote = {
  id: string;
  body: string;
  authorId?: string | null;
  authorEmail?: string | null;
  createdAt?: any;
};

function TicketNotes({ ticketId, canWrite }: { ticketId: string; canWrite: boolean }) {
  const [user] = useAuthState(auth);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const col = collection(db, "supportTickets", ticketId, "notes");
    const q = query(col, orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const items: TicketNote[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setNotes(items);
      setLoading(false);
    });
    return () => unsub();
  }, [ticketId]);

  const addNote = async () => {
    if (!canWrite || !user) return;
    const body = newNote.trim();
    if (!body) return;
    try {
      await addDoc(collection(db, "supportTickets", ticketId, "notes"), {
        body,
        authorId: user.uid,
        authorEmail: user.email || null,
        createdAt: serverTimestamp(),
      });
      setNewNote("");
    } catch (e: any) {
      alert(e?.message || "Failed to add note");
    }
  };

  return (
    <div className="mt-3 border-t pt-3">
      {loading ? (
        <p className="text-xs text-gray-500">Loading notes…</p>
      ) : notes.length === 0 ? (
        <p className="text-xs text-gray-500">No notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="text-xs p-2 rounded border">
              <p className="whitespace-pre-wrap text-gray-800">{n.body}</p>
              <div className="mt-1 text-[10px] text-gray-500 flex gap-2">
                {n.authorEmail ? <span>{n.authorEmail}</span> : null}
                {n.createdAt?.toDate ? (
                  <span>{new Date(n.createdAt.toDate()).toLocaleString()}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      {canWrite ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm flex-1"
            placeholder="Add a note…"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addNote();
            }}
          />
          <button className="border rounded px-2 py-1 text-sm" onClick={addNote}>
            Add
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminTicketsPage() {
  const [user] = useAuthState(auth);
  const [allowed, setAllowed] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("open");
  const [error, setError] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const uid = user?.uid;
      if (!uid) {
        if (active) setAllowed(false);
        return;
      }
      try {
        const token = await getIdTokenResult(user!, true);
        const isAdminClaim = !!(token?.claims as any)?.admin;
        const isAllowlist = ADMIN_UIDS.size > 0 ? ADMIN_UIDS.has(uid) : false;
        if (active) setAllowed(isAdminClaim || isAllowlist);
      } catch {
        const fallback = ADMIN_UIDS.size > 0 ? ADMIN_UIDS.has(uid) : false;
        if (active) setAllowed(fallback);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError("");
      try {
        const base = collection(db, "supportTickets");
        if (filter) {
          // Prefer server-side order; may require composite index.
          try {
            const q1 = query(base, where("status", "==", filter), orderBy("createdAt", "desc"), limit(200));
            const snap = await getDocs(q1);
            const items: Ticket[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
            setTickets(items);
          } catch (e: any) {
            // Fallback: no orderBy (no composite index needed); sort client-side.
            const q2 = query(base, where("status", "==", filter), limit(200));
            const snap2 = await getDocs(q2);
            const items2: Ticket[] = snap2.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
            items2.sort((a, b) => {
              const toMs = (t: any) => (t?.toMillis ? t.toMillis() : t?.toDate ? t.toDate().getTime() : 0);
              return (toMs(b.createdAt) || 0) - (toMs(a.createdAt) || 0);
            });
            setTickets(items2);
            // Expose index link in error banner if present
            const msg = e?.message || "";
            const m = msg.match(/https?:\/\/[^\s]+/);
            if (m?.[0]) setError(`Index recommended for better performance: ${m[0]}`);
          }
        } else {
          const q = query(base, orderBy("createdAt", "desc"), limit(200));
          const snap = await getDocs(q);
          const items: Ticket[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          setTickets(items);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [filter]);

  const changeStatus = async (id: string, status: Ticket["status"]) => {
    try {
      await updateDoc(doc(db, "supportTickets", id), { status });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    }
  };

  if (!allowed) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Admin Tickets</h1>
        <p className="text-sm text-gray-600 mt-2">Forbidden. Add your UID to ADMIN_UIDS in this file to access.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Support Tickets</h1>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <label>
          Status filter:
          <select className="ml-2 border rounded px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="closed">Closed</option>
            <option value="">All</option>
          </select>
        </label>
      </div>
      {loading ? (
        <p className="mt-4 text-sm">Loading...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : tickets.length === 0 ? (
        <p className="mt-4 text-sm">No tickets.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-md border p-3 theme-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{t.subject || "(no subject)"}</h3>
                <span className="text-xs text-gray-500">{t.status || "open"}</span>
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap">{t.description}</p>
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                {t.userEmail ? <p>Email: {t.userEmail}</p> : null}
                {t.userId ? <p>UserID: {t.userId}</p> : null}
                {t.preferredContact ? <p>Prefers: {t.preferredContact}</p> : null}
                {t.page ? <p>From: {t.page}</p> : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm items-center">
                <button className="border rounded px-2 py-1" onClick={() => changeStatus(t.id, "in_progress")}>In Progress</button>
                <button className="border rounded px-2 py-1" onClick={() => changeStatus(t.id, "closed")}>Close</button>
                <button className="ml-auto underline text-xs" onClick={() => setExpandedId((prev) => (prev === t.id ? null : t.id))}>
                  {expandedId === t.id ? "Hide notes" : "Show notes"}
                </button>
              </div>
              {expandedId === t.id ? (
                <TicketNotes ticketId={t.id} canWrite={allowed} />
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
