"use client";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
  limitToLast,
  endBefore,
  limit,
} from "firebase/firestore";
import { auth, db } from "../../firebase/Config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MessagesDisplay from "../components/messagesDisplay";
import Header from "../../components/Header";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, styled } from "@mui/material";
import Image from "next/image";
import { uploadImages as uploadAllImages } from "../../lib/uploadImage";
import { onSnapshot, serverTimestamp } from "firebase/firestore";
import ChatSideBar from "../components/ChatSideBar";
import message from "../../assets/message.webp";
import Avatar from "../../components/Avatar";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
type MessagesProps = { roomId: string };

// A chatRoomMapping query filtered ONLY by roomId is rejected by security
// rules: they require the requester to be in `userIds`, which Firestore cannot
// verify from a roomId-only query, so it denies the whole query ("Missing or
// insufficient permissions"). Query by the allowed array-contains predicate and
// narrow to the room client-side instead.
async function findMyMappingDocs(roomId: string, uid?: string | null) {
  if (!uid || !roomId) return [] as any[];
  const snap = await getDocs(
    query(collection(db, "chatRoomMapping"), where("userIds", "array-contains", uid))
  );
  return snap.docs.filter((d: any) => d.data().roomId === roomId);
}

const Messages: React.FC<MessagesProps & { currentUser?: any }> = ({ roomId, currentUser }) => {
  const roomRef = doc(db, "chatRoom", roomId);
  const messagesRef = collection(roomRef, "messages");
  const initialLimit = 50;
  const messagesQuery = query(messagesRef, orderBy("timestamp"), limitToLast(initialLimit));
  const [messages, loading, error] = useCollectionData(messagesQuery, {
    fieldId: "id",
  } as any);

  const [lastSeen, setLastSeen] = useState<any>(null);
  const [older, setOlder] = useState<any[]>([]);
  const [earliestAbsolute, setEarliestAbsolute] = useState<any>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  useEffect(() => {
    const loadMapping = async () => {
      try {
        // Find this user's mapping for the room (rule-compliant query)
        const mineForRoom = await findMyMappingDocs(roomId, auth.currentUser?.uid);
        const doc0 = mineForRoom[0];
        const d = doc0?.data() || {};
        // Prefer per-user lastRead if exists; fallback to legacy timestamp
        const authUid = auth.currentUser?.uid;
        if (authUid && d.lastRead && d.lastRead[authUid]) {
          setLastSeen(d.lastRead[authUid]);
        } else if (d.timestamp) {
          setLastSeen(d.timestamp);
        }
        // Probe earliest absolute message
        try {
          const earliestSnap = await getDocs(query(messagesRef, orderBy('timestamp'), limit(1)));
          const e0 = earliestSnap.docs[0]?.data();
          if (e0?.timestamp) setEarliestAbsolute(e0.timestamp);
        } catch {}
      } catch {
        // ignore
      }
    };
    loadMapping();
  }, [roomId]);
  // recompute hasMore based on earliest timestamps known
  useEffect(() => {
    const toMillis = (t: any) => t?.toMillis ? t.toMillis() : (t?.toDate ? t.toDate().getTime() : (typeof t === 'number' ? t : Date.parse(t)));
    const currentEarliest = (older && older.length > 0) ? older[0]?.timestamp : (messages && messages.length > 0 ? messages[0]?.timestamp : null);
    if (!currentEarliest || !earliestAbsolute) {
      setHasMore(false);
      return;
    }
    try {
      setHasMore(toMillis(currentEarliest) > toMillis(earliestAbsolute));
    } catch {
      setHasMore(false);
    }
  }, [JSON.stringify(older?.map(m => m?.id)?.slice(-3) || []), messages, earliestAbsolute]);

  const onLoadMore = async () => {
    try {
      const cursorTs = (older && older.length > 0) ? older[0]?.timestamp : (messages && messages.length > 0 ? messages[0]?.timestamp : null);
      if (!cursorTs) return;
      const olderSnap = await getDocs(query(messagesRef, orderBy('timestamp'), endBefore(cursorTs), limitToLast(30)));
      const batch: any[] = olderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (batch.length === 0) {
        setHasMore(false);
        return;
      }
      setOlder(prev => [...batch, ...prev]);
    } catch {}
  };
  // When viewing a room, mark as read for current user (simple policy: whenever new messages arrive and tab is focused)
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const markRead = async () => {
      try {
        const mineForRoom = await findMyMappingDocs(roomId, uid);
        const doc0 = mineForRoom[0];
        if (!doc0) return;
        await setDoc(doc(db, "chatRoomMapping", doc0.id), { lastRead: { [uid]: serverTimestamp() } }, { merge: true });
      } catch {}
    };
    const handleFocus = () => markRead();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') markRead();
      });
    }
    // Mark immediately when messages update and user is focused
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      markRead();
    }
    return () => {
      if (typeof window !== 'undefined') window.removeEventListener('focus', handleFocus);
    };
  }, [roomId, JSON.stringify((messages || []).slice(-3))]);
  if (loading) return <div>Loading...</div>;
  if (error) {
    // A permission-denied here almost always means an orphaned conversation
    // (the underlying chatRoom doc is missing). Show a calm message instead of
    // the raw Firebase error string.
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        This conversation is no longer available. Start a new one from the
        listing or the member&apos;s profile.
      </div>
    );
  }
  const merged = [...(older || []), ...(messages || [])];
  return <MessagesDisplay messages={merged} currentUser={currentUser} lastSeenTimestamp={lastSeen} hasMore={hasMore} onLoadMore={onLoadMore} />;
};
const ChatRoom = () => {
  const [chatRoomId, setChatRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParameters = new URLSearchParams(window.location.search);
      setChatRoomId(queryParameters.get("roomId") || "");
    }
  }, []);
  const backToList = () => {
    setChatRoomId("");
    setCurrentUser(null);
  };

  return (
    <>
      <Header />
      <div className="pt-16">
        <div className="mx-auto h-[calc(100dvh-64px)] w-full max-w-5xl overflow-hidden bg-white text-sm md:my-5 md:h-[calc(100dvh-7rem)] md:rounded-2xl md:shadow-[0_0_18px_rgba(0,0,0,0.12)]">
          <div className="grid h-full grid-cols-1 md:grid-cols-12">
            {/* Conversation list: always on desktop; on mobile only when no thread is open */}
            <div
              className={`${
                chatRoomId ? "hidden" : "block"
              } h-full min-h-0 overflow-hidden border-gray-200 md:col-span-4 md:block md:border-r`}
            >
              <ChatSideBar
                chatRoomId={chatRoomId}
                setChatRoomId={setChatRoomId}
                setCurrentUser={setCurrentUser}
              />
            </div>

            {/* Thread pane */}
            <div
              className={`${
                chatRoomId ? "block" : "hidden md:block"
              } h-full min-h-0 md:col-span-8`}
            >
              {chatRoomId !== "" ? (
                <div className="grid h-full grid-rows-12">
                  <ChatBox
                    chatRoomId={chatRoomId}
                    currentUser={currentUser}
                    onBack={backToList}
                  />
                </div>
              ) : (
                <div className="hidden h-full flex-col items-center justify-center px-6 text-center md:flex">
                  <Image src={message} width={260} height={260} alt="" />
                  <p className="-mt-4 text-base font-semibold text-gray-800">
                    Select a conversation
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-gray-500">
                    Choose a chat from the list, or start one by booking or
                    messaging an owner from a listing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default ChatRoom;

type ChatBoxProps = { chatRoomId: string; currentUser: any; onBack?: () => void };
const ChatBox: React.FC<ChatBoxProps> = ({ chatRoomId, currentUser, onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };
  const roomRef = doc(db, "chatRoom", chatRoomId);
  const [chatRoomMappingId, setChatRoomMappingId] = useState("");
  const [oppUserId, setOppUserId] = useState("");
  const [user] = useAuthState(auth);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const [imageUploader, setImageUploader] = useState(false);
  const [oppTyping, setOppTyping] = useState(false);
  const typingTimeout = useRef<any>(null);
  useEffect(() => {
    if (user) {
      const fetchMappingId = async () => {
        try {
          const mineForRoom = await findMyMappingDocs(chatRoomId, user.uid);
          const d0 = mineForRoom[0];
          if (!d0) return;
          setChatRoomMappingId(d0.id);
          const oppositeUserId: any = (d0.data().userIds || []).filter(
            (id: string) => id !== user.uid
          )[0];
          setOppUserId(oppositeUserId);
        } catch (e) {
          // Non-fatal: typing indicator / read receipts just won't update.
          console.warn("Could not resolve chat mapping:", e);
        }
      };
  fetchMappingId();
    }
  }, [user, chatRoomId]);

  // Subscribe to typing indicator
  useEffect(() => {
    if (!chatRoomMappingId) return;
    const unsub = onSnapshot(doc(db, 'chatRoomMapping', chatRoomMappingId), (snap) => {
      const d = snap.data();
      if (!d) return;
      setOppTyping(Boolean(d.typing && d.typingUserId !== user?.uid));
    });
    return () => unsub();
  }, [chatRoomMappingId, user?.uid]);
  const uploadImages = async () => {
    return uploadAllImages(
      files,
      (image: File) =>
        `images/chat/${user?.uid || "anon"}/${image.lastModified}-${image.name}`
    );
  };
  const handleAddMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const text = newMessage.trim();
    if (text === "" || !chatRoomId) {
      return;
    }
    // Clear the input immediately for snappy UX; restore it if the send fails.
    setNewMessage("");
    try {
      // The critical write: post the message. Do this FIRST so nothing else
      // (a missing mapping id, a failed timestamp update) can block it.
      await addDoc(collection(roomRef, "messages"), {
        message: text,
        userId: user.uid,
        type: "text",
        photoURL: user.photoURL || null,
        timestamp: serverTimestamp(),
      });
      // Best-effort: bump the mapping(s) so the conversation sorts to top and
      // unread counts stay accurate. Never let these block or fail the send.
      try {
        const mineForRoom = await findMyMappingDocs(chatRoomId, user.uid);
        await Promise.all(
          mineForRoom.map((d) =>
            setDoc(
              doc(db, "chatRoomMapping", d.id),
              {
                timestamp: serverTimestamp(),
                lastMessageTs: serverTimestamp(),
                lastRead: { [user.uid]: serverTimestamp() },
                typing: false,
                typingUserId: user.uid,
              },
              { merge: true }
            )
          )
        );
      } catch (e) {
        console.warn("Message sent, but updating conversation metadata failed:", e);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(text); // restore so the user doesn't lose their text
    }
  };

  const handleAddImages = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const downloadURLs = await uploadImages();
  const m = await addDoc(collection(roomRef, "messages"), {
        message: downloadURLs,
        userId: user.uid,
        type: "image",
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
      });
  const mapDocs2 = await findMyMappingDocs(chatRoomId, user.uid);
  await Promise.all(mapDocs2.map(d => setDoc(doc(db, 'chatRoomMapping', d.id), { lastMessageTs: serverTimestamp(), timestamp: serverTimestamp(), lastRead: { [user.uid]: serverTimestamp() } }, { merge: true })));
      setFiles([]);
      setImageUploader(false);
      // No alert needed — the uploaded images appear immediately in the thread.
    } catch (e) {
      console.error("Error uploading images:", e);
    }
  };
  return (
    <>
      <div className="row-start-1 row-end-2 flex flex-row items-center gap-1 bg-black px-2 py-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label="Back to conversations"
          >
            <ArrowBackIcon fontSize="small" />
          </button>
        )}
        <div className="mx-1 shrink-0">
          <Avatar src={currentUser?.photoURL} name={currentUser?.userName} size={40} />
        </div>
        <p className="truncate text-sm font-semibold text-white">
          {currentUser?.userName || "Conversation"}
        </p>
      </div>
      {imageUploader === false ? (
        <div className="row-start-2 row-end-12 min-h-0 min-w-full p-3 w-full overflow-x-hidden overflow-y-auto no-scrollbar relative">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #cdd6e0 0%, #bcc7d4 100%)",
            }}
          />
          <div className="relative h-full w-full">
            <Messages roomId={chatRoomId} currentUser={currentUser} />
          </div>
        </div>
      ) : (
        <></>
      )}
      {imageUploader === false ? (
         <div className="row-start-12 row-end-13 flex flex-row items-center w-full justify-between px-2 gap-2">
          <div className="ml-2 text-xs text-gray-600 min-h-4" aria-live="polite">{oppTyping ? `${currentUser?.userName?.split(' ')?.[0] || 'Someone'} is typing…` : ' '}</div>
           <input
            type="text"
            value={newMessage}
            onChange={async (e) => {
              setNewMessage(e.target.value);
              if (!user) return;
              if (typingTimeout.current) clearTimeout(typingTimeout.current);
              await setDoc(doc(db, 'chatRoomMapping', chatRoomMappingId), { typing: true, typingUserId: user.uid }, { merge: true });
              typingTimeout.current = setTimeout(async () => {
                await setDoc(doc(db, 'chatRoomMapping', chatRoomMappingId), { typing: false, typingUserId: user.uid }, { merge: true });
              }, 1200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddMessage();
              }
            }}
             className="border-black p-2 rounded-md flex-1 min-w-0"
            placeholder="Type a message..."
            style={{
               border: "1px solid black",
            }}
          />
          <button
            onClick={() => {
              setImageUploader(true);
            }}
          >
            <AttachFileIcon fontSize={"medium"} />
          </button>
           <button
            onClick={handleAddMessage}
            disabled={newMessage.trim() === ''}
            className="text-white bg-black disabled:bg-gray-400 p-2 px-4 rounded-md flex flex-row items-center text-sm font-sans font-bold"
          >
            Send
            <SendIcon fontSize={"small"} className="ml-1" />
          </button>
        </div>
      ) : (
        <></>
      )}

      {imageUploader === true ? (
        <div className="row-start-2 row-end-13 p-4">
          <div className="pb-3 border-b-2 flex flex-row justify-between">
            <h1 className="text-lg font-sans font-semibold">Upload Images</h1>
            <button
              onClick={() => {
                setImageUploader(false);
                setFiles([]);
              }}
            >
              <CloseIcon className="cursor-pointer" />
            </button>
          </div>
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            className=" text-black"
            style={{
              width: "150px",
              height: "150px",
              border: "1px solid grey",
            }}
          >
            <AddIcon />
            <VisuallyHiddenInput accept="image/*" type="file" onChange={handleFileChange} />
          </Button>
          <div>
            <p>Uploaded Images</p>
            <div
              className="w-full max-w-2xl overflow-x-auto"
              style={{
                height: "200px",
              }}
            >
              <div className="flex flex-row gap-2" style={{}}>
                {files.map((file,index) => (
                  <div className="" key={index}>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="d"
                      width={200}
                      height={200}
                      style={{
                        width: "100%",
                        height: "200px",
                      }}
                    />
                  </div>
                ))}
              </div>
              <button
                className="p-3 bg-black text-white w-full rounded-md px-10 flex flex-row items-center text-sm font-sans font-bold"
                onClick={handleAddImages}
              >
                Send <SendIcon fontSize={"small"} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
