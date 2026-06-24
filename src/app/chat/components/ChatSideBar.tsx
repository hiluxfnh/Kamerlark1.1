import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/Config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Avatar from "../../components/Avatar";
import { useI18n } from "../../lib/i18n";

const ChatSideBar = ({ chatRoomId, setChatRoomId, setCurrentUser }) => {
  const { t } = useI18n();
  const [user] = useAuthState(auth);
  const [chatRooms, setChatRooms] = useState([]);
  const humanizeTime = (date: any) => {
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.floor((startOfNow.getTime() - startOfD.getTime()) / 86400000);
      if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return t('chat.yesterday');
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };
  useEffect(() => {
    if (!user) return;
    const docRef = collection(db, "chatRoomMapping");

    // Process a snapshot into chat-room rows. Each room is wrapped in its own
    // try/catch so a single malformed mapping doc (e.g. missing opposite user)
    // can never wipe out the entire conversation list.
    const handleSnap = async (snap: any) => {
      const data = snap.docs.filter((d: any) => (d.data().userIds || []).includes(user.uid));
      const rows = await Promise.all(
        data.map(async (room: any) => {
          try {
            const mapping = room.data();
            const oppositeUserId = (mapping.userIds || []).find((id: string) => id !== user.uid);
            if (!oppositeUserId || !mapping.roomId) return null; // skip malformed mappings
            const userSnap = await getDoc(doc(db, "Users", oppositeUserId));
            const oppositeUser = userSnap.data();
            const messagesRef = collection(db, "chatRoom", mapping.roomId, "messages");
            const lastSnap = await getDocs(query(messagesRef, orderBy("timestamp", "desc"), limit(1)));
            const lastMsg = lastSnap.docs[0]?.data();
            const toMillis = (t: any) => t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : (typeof t === 'number' ? t : Date.parse(t)));
            const mappingTs = mapping.timestamp ? toMillis(mapping.timestamp) : 0;
            const lastTs = lastMsg?.timestamp ? toMillis(lastMsg.timestamp) : 0;
            let lastReadTs = mappingTs;
            if (mapping.lastRead && mapping.lastRead[user.uid]) lastReadTs = toMillis(mapping.lastRead[user.uid]);
            const unread = Boolean(lastMsg && lastMsg.userId !== user.uid && lastTs > lastReadTs);
            let unreadCount = 0;
            try {
              const sampleSnap = await getDocs(query(messagesRef, orderBy('timestamp', 'desc'), limit(10)));
              unreadCount = sampleSnap.docs.filter((d) => {
                const m = d.data();
                return m.userId !== user.uid && toMillis(m.timestamp) > lastReadTs;
              }).length;
            } catch {}
            const toDate = (t: any) => t?.toDate ? t.toDate() : (typeof t === 'number' ? new Date(t) : (t?.seconds ? new Date(t.seconds * 1000) : new Date()));
            const lmDate = lastMsg?.timestamp ? toDate(lastMsg.timestamp) : (mapping.timestamp ? toDate(mapping.timestamp) : new Date());
            const lastMessageTime = humanizeTime(lmDate);
            const time = mapping.timestamp?.toDate ? mapping.timestamp.toDate() : new Date();
            const timeStr = time.toLocaleString();
            return {
              id: room.id,
              user: oppositeUser,
              ...mapping,
              date: timeStr.split(',')[0],
              time: timeStr.split(',')[1],
              lastMessage: lastMsg?.type === 'text' ? String(lastMsg.message) : (lastMsg?.type === 'image' ? `📷 ${t('chat.photo')}` : ''),
              unread,
              unreadCount,
              lastMessageTime,
              _oppId: oppositeUserId,
              _hasMessages: Boolean(lastMsg),
              _sortTs: Math.max(mappingTs, lastTs),
            };
          } catch (e) {
            console.warn("Skipping a chat room that failed to load:", e);
            return null;
          }
        })
      );
      // Collapse duplicate conversations with the same person (legacy data
      // created more than one mapping per user pair). Keep the one that has
      // real messages / most recent activity — that's the working room, so the
      // user never lands on a stale duplicate that 404s on open.
      const byOpponent = new Map<string, any>();
      for (const r of rows.filter(Boolean) as any[]) {
        const key = r._oppId || r.roomId || r.id;
        const existing = byOpponent.get(key);
        if (
          !existing ||
          (r._hasMessages && !existing._hasMessages) ||
          ((r._hasMessages === existing._hasMessages) && (r._sortTs || 0) > (existing._sortTs || 0))
        ) {
          byOpponent.set(key, r);
        }
      }
      const deduped = Array.from(byOpponent.values()).sort(
        (a: any, b: any) => (b._sortTs || 0) - (a._sortTs || 0)
      );
      setChatRooms(deduped);
    };

    // Preferred: indexed query (newest first). If the composite index is missing,
    // fall back to an unordered query so the list still loads.
    const qRooms = query(docRef, where("userIds", "array-contains", user.uid), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(
      qRooms,
      handleSnap,
      (err) => {
        console.warn("Chat list ordered query failed, falling back unordered:", err?.message);
        const fallbackUnsub = onSnapshot(
          query(docRef, where("userIds", "array-contains", user.uid)),
          handleSnap,
          (e2) => console.error("Chat list failed to load:", e2)
        );
        (unsubRef as any).current = fallbackUnsub;
      }
    );
    const unsubRef = { current: unsub } as { current: () => void };
    return () => { try { (unsubRef.current || unsub)(); } catch {} };
  }, [user]);
  return (
    <div className="flex h-full flex-col bg-white">
      <h1 className="shrink-0 bg-black px-4 py-4 text-lg font-semibold text-white">
        {t("chat.messagesTitle")}
      </h1>
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            {t("chat.noConversations")}
            <br />
            {t("chat.startHint")}
          </div>
        ) : (
          chatRooms.map((room) => {
            const active = room.roomId === chatRoomId;
            const name = room?.user?.userName
              ? String(room.user.userName).split(" ").slice(0, 2).join(" ")
              : t("chat.unknown");
            return (
              <button
                key={room.id}
                onClick={() => {
                  setChatRoomId(room.roomId);
                  setCurrentUser(room.user);
                }}
                className={`flex w-full items-center gap-3 border-b border-gray-100 px-3 py-3 text-left transition-colors ${
                  active ? "bg-cyan-50" : "hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <div className="shrink-0">
                  <Avatar
                    src={room?.user?.photoURL}
                    name={room?.user?.userName}
                    size={48}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-semibold text-gray-900">
                      {name}
                    </p>
                    <span className="shrink-0 text-[11px] font-medium text-gray-400">
                      {room?.lastMessageTime || ""}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={`truncate text-xs ${
                        room.unread
                          ? "font-medium text-gray-800"
                          : "text-gray-500"
                      }`}
                    >
                      {room.lastMessage || t("chat.tapToOpen")}
                    </p>
                    {room.unread && (
                      <span className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-cyan-600 px-1.5 text-[11px] font-semibold text-white">
                        {room.unreadCount > 0 ? room.unreadCount : ""}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
export default ChatSideBar;
