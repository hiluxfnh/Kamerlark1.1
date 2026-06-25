import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "../../firebase/Config";
import Image from "next/image";
import Avatar from "../../components/Avatar";
import BookingComponent from "./BookingComponent";
import TimeStampConvertor from "../../components/timestampConvertor";
import AppointmentComponent from "./AppointmentComponent";
import { useI18n } from "../../lib/i18n";

const MessagesDisplay = ({ messages, currentUser, lastSeenTimestamp, hasMore, onLoadMore }: { messages: any[]; currentUser?: any; lastSeenTimestamp?: any; hasMore?: boolean; onLoadMore?: () => void; }) => {
  const { t } = useI18n();
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

  const renderImages = (raw: string[] | string) => {
    // Image messages should be an array of URLs, but legacy/bad docs may store
    // a single string, undefined, or empty entries. Normalise and drop empties
    // so <Image> never receives an empty src (which crashes the page).
    const urls = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(
      (u) => typeof u === "string" && u.trim().length > 0
    );
    if (urls.length === 0) return null;
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
  const isSameSenderAsNext = (idx: number) => idx < messages.length - 1 && messages[idx + 1]?.userId === messages[idx]?.userId;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-x-hidden overflow-y-auto no-scrollbar px-2 py-1 text-sm font-sans">
      {hasMore ? (
        <div className="w-full flex justify-center py-2">
          <button
            className="text-xs px-3 py-1 rounded-full border border-black/10 bg-white/90 text-gray-700 shadow-sm hover:bg-white"
            onClick={() => {
              onLoadMore && onLoadMore();
            }}
          >
            {t("chat.loadOlder")}
          </button>
        </div>
      ) : null}
      {messages && messages.map((msg, index) => {
        const own = msg.userId === user?.uid;
        const firstOfGroup = !isSameSenderAsPrev(index);
        const lastOfGroup = !isSameSenderAsNext(index);
        const isSpecial = msg.type === "booking" || msg.type === "appointment";
        return (
          <div
            key={msg.id || `msg-${index}`}
            className={`flex w-full ${own ? "justify-end" : "justify-start"} ${
              firstOfGroup ? "mt-3" : "mt-[3px]"
            }`}
          >
            <div
              className={`flex max-w-[82%] items-end gap-2 sm:max-w-[68%] ${
                own ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar only on the other person's messages, at the end of a group */}
              {!own &&
                (lastOfGroup ? (
                  <Avatar
                    src={msg.photoURL}
                    name={currentUser?.userName || msg.userName || msg.name || t("chat.userFallback")}
                    size={28}
                  />
                ) : (
                  <div className="w-7 shrink-0" />
                ))}
              <div className={`flex min-w-0 flex-col ${own ? "items-end" : "items-start"}`}>
                {msg.type === "text" && (
                  <div
                    className={`break-words px-3.5 py-2 text-[14px] leading-snug ${
                      own
                        ? "rounded-2xl rounded-br-md bg-[#082e4d] text-white"
                        : "rounded-2xl rounded-bl-md bg-white text-gray-900 ring-1 ring-black/[0.06] shadow-sm"
                    }`}
                  >
                    {msg.message}
                  </div>
                )}
                {msg.type === "image" && (
                  <div
                    className={`overflow-hidden rounded-2xl ${
                      own ? "rounded-br-md" : "rounded-bl-md ring-1 ring-black/[0.06]"
                    }`}
                  >
                    {renderImages(msg.message)}
                  </div>
                )}
                {msg.type === "booking" && (
                  <div className="mt-1">
                    <BookingComponent message={msg} />
                  </div>
                )}
                {msg.type === "appointment" && (
                  <div className="mt-1">
                    <AppointmentComponent message={msg} />
                  </div>
                )}
                {lastOfGroup && !isSpecial && (
                  <span className="mt-1 px-1 text-[10px] text-gray-400">
                    {TimeStampConvertor(msg.timestamp)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {!atBottom && (
        <div className="pointer-events-none sticky bottom-1 z-10 flex justify-end pr-1">
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#082e4d] text-white shadow-lg transition-transform hover:scale-105"
            aria-label={t("chat.scrollToLatest")}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};
export default MessagesDisplay;
