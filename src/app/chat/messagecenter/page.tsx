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
import { auth, db, storage } from "../../firebase/Config";
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
import { Button, styled } from "@mui/material";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { onSnapshot, serverTimestamp } from "firebase/firestore";
import ChatSideBar from "../components/ChatSideBar";
import backImage from "../../assets/backChat.jpg";
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
const Messages: React.FC<MessagesProps> = ({ roomId }) => {
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
        // Find mapping by roomId
        const q = query(collection(db, "chatRoomMapping"), where("roomId", "==", roomId));
        const snap = await getDocs(q);
        const doc0 = snap.docs[0];
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
        const q = query(collection(db, "chatRoomMapping"), where("roomId", "==", roomId));
        const snap = await getDocs(q);
        const doc0 = snap.docs[0];
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
  if (error) return <div>Error: {error.message}</div>;
  const merged = [...(older || []), ...(messages || [])];
  return <MessagesDisplay messages={merged} lastSeenTimestamp={lastSeen} hasMore={hasMore} onLoadMore={onLoadMore} />;
};
const ChatRoom = () => {
  const [chatRoomId, setChatRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParameters = new URLSearchParams(window.location.search);
      setChatRoomId(queryParameters.get("roomId") || "");
    }
  }, []);
  return (
    <>
      <Header />
      <div className="pt-16">
        <div
          className="h-170 grid grid-cols-12 w-full md:w-256 mx-auto my-5 rounded-lg text-sm overflow-hidden px-3 md:px-0"
          style={{ boxShadow: "0px 0px 15px 0px rgba(0,0,0,0.2)" }}
        >
          {/* Mobile toggle */}
          <div className="col-span-12 md:hidden flex items-center justify-between mb-2">
            <button
              className="px-3 py-2 text-sm rounded-md border border-gray-300"
              onClick={() => setMobileSidebarOpen(true)}
            >
              Chats
            </button>
          </div>

          {/* Sidebar (desktop) */}
          <div className="hidden md:block md:col-start-1 md:col-end-5 border-r-2">
            <ChatSideBar
              chatRoomId={chatRoomId}
              setChatRoomId={setChatRoomId}
              setCurrentUser={setCurrentUser}
            />
          </div>

          {/* Chat content */}
          <div className="col-span-12 md:col-start-5 md:col-end-13 grid grid-rows-12 max-h-full">
            {chatRoomId !== "" ? (
              <ChatBox chatRoomId={chatRoomId} currentUser={currentUser} />
            ) : (
              <div className="flex flex-col justify-center items-center mt-28">
                <Image src={message} width={400} height={400} alt="back" />
                <button
                  className="bg-black p-3 px-4 rounded-md text-white"
                  style={{ marginTop: "-50px" }}
                >
                  Start Messaging
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-4/5 max-w-xs bg-white shadow-xl">
              <ChatSideBar
                chatRoomId={chatRoomId}
                setChatRoomId={(id: string) => {
                  setChatRoomId(id);
                  setMobileSidebarOpen(false);
                }}
                setCurrentUser={setCurrentUser}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default ChatRoom;

type ChatBoxProps = { chatRoomId: string; currentUser: any };
const ChatBox: React.FC<ChatBoxProps> = ({ chatRoomId, currentUser }) => {
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
        const chatRoomMappingQuery = query(
          collection(db, "chatRoomMapping"),
          where("roomId", "==", chatRoomId)
        );
        const chatRoomMappingSnapshot = await getDocs(chatRoomMappingQuery);
        chatRoomMappingSnapshot.forEach((doc) => {
          setChatRoomMappingId(doc.id);
          const oppositeUserId: any = doc
            .data()
            .userIds.filter((id) => id !== user.uid)[0];
          setOppUserId(oppositeUserId);
        });
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
    const uploadPromises = files.map((image) => {
      const storageRef = ref(storage, `images/chat/${user?.uid || 'anon'}/${image.lastModified}-${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress function (optional)
          },
          (error) => {
            console.error("Error uploading image:", error);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    });
    return Promise.all(uploadPromises);
  };
  const handleAddMessage = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
  if (newMessage.trim() === "") {
      return;
    }
    await setDoc(
      doc(db, "chatRoomMapping", chatRoomMappingId),
      {
  timestamp: serverTimestamp(),
  // Per-user lastRead map: write sender's lastRead on send to help self-read consistency
  lastRead: { [user.uid]: serverTimestamp() },
    typing: false,
    typingUserId: user.uid,
      },
      { merge: true }
    );
    await addDoc(collection(roomRef, "messages"), {
      message: newMessage,
      userId: user.uid,
      type: "text",
      photoURL: user.photoURL,
      timestamp: serverTimestamp(),
    });
    // update lastMessageTs on mapping for unread counts
    try {
      const q = query(collection(db, 'chatRoomMapping'), where('roomId', '==', chatRoomId));
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => setDoc(doc(db, 'chatRoomMapping', d.id), { lastMessageTs: serverTimestamp() }, { merge: true })));
    } catch {}
    setNewMessage("");
    // scrollRef.current.scrollIntoView({ behavior: "smooth" });
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
  const mappingQ2 = query(collection(db, 'chatRoomMapping'), where('roomId', '==', chatRoomId));
  const mapSnap2 = await getDocs(mappingQ2);
  await Promise.all(mapSnap2.docs.map(d => setDoc(doc(db, 'chatRoomMapping', d.id), { lastMessageTs: serverTimestamp() }, { merge: true })));
      await setDoc(doc(db, "chatRoomMapping", chatRoomMappingId), {
        timestamp: serverTimestamp(),
        lastRead: { [user.uid]: serverTimestamp() },
      }, { merge: true });
      setFiles([]);
      setImageUploader(false);
      alert("Images uploaded successfully");
    } catch (e) {
      console.error("Error uploading images:", e);
    }
  };
  return (
    <>
      <div className="row-start-1 row-end-2 bg-black flex flex-row items-center">
        <div className="mx-3">
          <Avatar src={currentUser?.photoURL} name={currentUser?.userName} size={40} />
        </div>
        <p className="text-white text-sm font-sans font-semibold">
          {currentUser?.userName}
        </p>
      </div>
      {imageUploader === false ? (
        <div className="row-start-2 row-end-12 min-w-full p-3 w-full overflow-x-hidden overflow-y-scroll no-scrollbar max-h-140 relative">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backImage.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "blur(2px)",
              opacity: 0.35,
            }}
          />
          <div className="relative h-full w-full">
            <Messages roomId={chatRoomId} />
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
              className="w-170"
              style={{
                height: "200px",
              }}
            >
              <div className="flex flex-row" style={{}}>
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
