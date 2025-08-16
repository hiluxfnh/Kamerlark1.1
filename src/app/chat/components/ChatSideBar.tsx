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

const ChatSideBar = ({ chatRoomId, setChatRoomId, setCurrentUser }) => {
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
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };
  useEffect(() => {
    if (!user) return;
    const docRef = collection(db, "chatRoomMapping");
    const qRooms = query(docRef, where("userIds", "array-contains", user.uid), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(qRooms, async (snap) => {
      const data = snap.docs.filter((d) => (d.data().userIds || []).includes(user.uid));
      const results: any[] = [];
  await Promise.all(data.map(async (room) => {
        const mapping = room.data();
        const oppositeUserId = mapping.userIds.find((id: string) => id !== user.uid);
        const userRef = doc(db, "Users", oppositeUserId);
        const userSnap = await getDoc(userRef);
        const oppositeUser = userSnap.data();
        const messagesRef = collection(db, "chatRoom", mapping.roomId, "messages");
        const lastQ = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
        const lastSnap = await getDocs(lastQ);
        const lastMsg = lastSnap.docs[0]?.data();
        const toMillis = (t: any) => t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : (typeof t === 'number' ? t : Date.parse(t)));
  const mappingTs = mapping.timestamp ? toMillis(mapping.timestamp) : 0;
  const lastTs = lastMsg?.timestamp ? toMillis(lastMsg.timestamp) : 0;
        let lastReadTs = mappingTs;
        if (mapping.lastRead && mapping.lastRead[user.uid]) lastReadTs = toMillis(mapping.lastRead[user.uid]);
        const unread = Boolean(lastMsg && lastMsg.userId !== user.uid && lastTs > lastReadTs);
        // Compute a small unread count sample (up to 10 recent messages)
        let unreadCount = 0;
        try {
          const sampleQ = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
          const sampleSnap = await getDocs(sampleQ);
          unreadCount = sampleSnap.docs.filter(d => {
            const m = d.data();
            const mts = toMillis(m.timestamp);
            return m.userId !== user.uid && mts > lastReadTs;
          }).length;
        } catch {}
        // Compute last message time string (fallback to mapping timestamp)
        const toDate = (t: any) => t?.toDate ? t.toDate() : (typeof t === 'number' ? new Date(t) : (t?.seconds ? new Date(t.seconds * 1000) : new Date()));
  const lmDate = lastMsg?.timestamp ? toDate(lastMsg.timestamp) : (mapping.timestamp ? toDate(mapping.timestamp) : new Date());
  const lastMessageTime = humanizeTime(lmDate);
        const time = mapping.timestamp?.toDate ? mapping.timestamp.toDate() : new Date();
        const timeStr = time.toLocaleString();
        results.push({
          id: room.id,
          user: oppositeUser,
          ...mapping,
          date: timeStr.split(',')[0],
          time: timeStr.split(',')[1],
          lastMessage: lastMsg?.type === 'text' ? String(lastMsg.message) : (lastMsg?.type === 'image' ? '📷 Image' : ''),
          unread,
          unreadCount,
          lastMessageTime,
        });
      }));
      setChatRooms(results);
    });
    return () => unsub();
  }, [user]);
  return (
    <div>
      <h1 className="text-xl font-sans font-semibold px-3 py-3 pb-4 bg-black text-white">
        KAMERLARK CHAT
      </h1>
    {chatRooms.map((room) => (
        <button
      className="flex flex-row items-center justify-between border-b-2 p-2 cursor-pointer min-w-full max-w-full h-16"
          onClick={() => {
            setChatRoomId(room.roomId);
            setCurrentUser(room.user);
          }}
          key={room.id}
        >
          <div className="flex flex-row items-center">
            <div className="mx-2">
              <Avatar src={room?.user?.photoURL} name={room?.user?.userName} size={40} />
            </div>
            <div className="flex flex-col items-start">
              <p
                className="font-sans font-semibold"
                style={{
                  textAlign: "left",
                }}
              >
                {(room && room.user && room.user.userName
                  ? String(room.user.userName)
                      .split(" ")
                      .slice(0, 2)
                      .join(" ")
                  : "")}
              </p>
              <p className="text-xs text-gray-600 max-w-40 truncate">
                {room.lastMessage || ""}
              </p>
            </div>
          </div>
          <div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] text-gray-500 leading-none">
                {room?.lastMessageTime || (room?.time ? `${room?.time?.split(":")[0]}:${room?.time?.split(":")[1]}` : "")}
              </p>
              {room.unread && (
                <span className="mt-2 inline-flex items-center justify-center min-w-4 h-4 px-1 bg-cyan-600 text-white text-[10px] rounded-full">
                  {room.unreadCount > 0 ? room.unreadCount : ''}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
export default ChatSideBar;
