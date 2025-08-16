import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../../firebase/Config";
import Image from "next/image";
import Avatar from "../../components/Avatar";
import BookingComponent from "./BookingComponent";
import TimeStampConvertor from "../../components/timestampConvertor";
import AppointmentComponent from "./AppointmentComponent";

const MessagesDisplay = ({ messages, lastSeenTimestamp, hasMore, onLoadMore }: { messages: any[]; lastSeenTimestamp?: any; hasMore?: boolean; onLoadMore?: () => void; }) => {
  const [user] = useAuthState(auth);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const threshold = 100; // px
  const scrollToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setAtBottom(true);
  };
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
      setAtBottom(distance < threshold);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [messages, atBottom]);

  const isAfter = (ts: any, last: any) => {
    if (!last) return false;
    try {
      const toMillis = (t: any) => t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : (typeof t === 'number' ? t : Date.parse(t)));
      return toMillis(ts) > toMillis(last);
    } catch { return false; }
  };
  const firstUnreadIndex = useMemo(() => {
    if (!Array.isArray(messages) || !lastSeenTimestamp) return -1;
    return messages.findIndex((m: any) => isAfter(m.timestamp, lastSeenTimestamp));
  }, [messages, lastSeenTimestamp]);

  const renderImages = (urls: string[]) => {
    if (!urls || urls.length === 0) return null;
    if (urls.length === 1) {
      return (
        <div className="rounded-lg overflow-hidden">
          <Image
            loading="lazy"
            src={urls[0]}
            alt="image"
            width={400}
            height={400}
            className="h-auto w-full max-w-64 sm:max-w-80 object-cover"
          />
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-2 max-w-xs sm:max-w-sm">
        {urls.map((u, i) => (
          <div key={i} className={`rounded-lg overflow-hidden ${i === urls.length - 1 && urls.length % 2 === 1 ? 'col-span-2' : ''}`}>
            <Image
              loading="lazy"
              src={u}
              alt={`image-${i}`}
              width={300}
              height={300}
              className="h-36 sm:h-40 w-full object-cover"
            />
          </div>
        ))}
      </div>
    );
  };

  const isSameSenderAsPrev = (idx: number) => idx > 0 && messages[idx - 1]?.userId === messages[idx]?.userId;

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden overflow-y-scroll no-scrollbar max-h-130 text-sm font-sans px-1">
      {hasMore ? (
        <div className="w-full flex justify-center py-2">
          <button
            className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            onClick={() => {
              onLoadMore && onLoadMore();
            }}
          >
            Load older messages
          </button>
        </div>
      ) : null}
      {!atBottom && (
        <button onClick={scrollToBottom} className="absolute right-3 bottom-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full shadow">New messages ↓</button>
      )}
      {messages && messages.map((msg, index) => {
        const own = msg.userId === user?.uid;
        const showAvatar = !isSameSenderAsPrev(index);
        return (
          <div key={msg.id} className={`w-full flex ${own ? 'justify-end' : 'justify-start'} mb-1`}>
            {index === firstUnreadIndex && (
              <div className="absolute left-0 right-0 flex items-center justify-center -mt-3">
                <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow">New</div>
              </div>
            )}
            <div className={`flex items-end ${own ? 'flex-row-reverse' : 'flex-row'} max-w-[85%] sm:max-w-[75%]`}>
              {showAvatar ? (
                <div className="mx-2 shrink-0">
                  <Avatar src={msg.photoURL} name={msg.userName || msg.name || "User"} size={40} />
                </div>
              ) : (
                <div className="w-10 mx-2" />
              )}
              <div className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                {msg.type === 'text' && (
                  <div className={`${own ? 'bg-cyan-700 text-white' : 'bg-gray-100 text-black'} px-3 py-2 rounded-2xl ${own ? 'rounded-br-sm' : 'rounded-bl-sm'} shadow-sm break-words`}>
                    {msg.message}
                  </div>
                )}
                {msg.type === 'image' && (
                  <div className={`${own ? 'bg-cyan-700/5' : 'bg-gray-100'} p-2 rounded-2xl ${own ? 'rounded-br-sm' : 'rounded-bl-sm'} shadow-sm`}>
                    {renderImages(msg.message)}
                  </div>
                )}
                {msg.type === 'booking' && (
                  <div className="mt-1">
                    <BookingComponent message={msg} />
                  </div>
                )}
                {msg.type === 'appointment' && (
                  <div className="mt-1">
                    <AppointmentComponent message={msg} />
                  </div>
                )}
                <span className="mt-1 text-[10px] text-gray-500">{TimeStampConvertor(msg.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default MessagesDisplay;
