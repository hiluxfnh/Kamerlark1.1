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
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase/Config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCollectionData } from "react-firebase-hooks/firestore";
import MessagesDisplay from "../components/messagesDisplay";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Button, ImageList, ImageListItem, styled } from "@mui/material";
import Image from "next/image";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import ChatSideBar from "../components/ChatSideBar";
import backImage from "../../assets/backChat.jpg";
import message from "../../assets/message.webp";

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
const Messages = ({ roomId }) => {
  const roomRef = doc(db, "chatRoom", roomId);
  const messagesRef = collection(roomRef, "messages");
  const messagesQuery = query(messagesRef, orderBy("timestamp"));
  const [messages, loading, error] = useCollectionData(messagesQuery, {
    idField: "id",
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="">
      <MessagesDisplay messages={messages} />
      {/* <div ref={messagesEndRef} /> */}
    </div>
  );
};
const ChatRoom = () => {
  const [chatRoomId, setChatRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    if (window) {
      const queryParameters = new URLSearchParams(window.location.search);
      setChatRoomId(queryParameters.get("roomId") || "");
    }
  }, []);
  return (
    <>
      <Header />
      <div
        className="h-170 grid grid-cols-12 w-256 mx-auto my-5 rounded-lg text-sm overflow-hidden"
        style={{
          boxShadow: "0px 0px 15px 0px rgba(0,0,0,0.2)",
        }}
      >
        <div className="col-start-1 col-end-5 border-r-2">
          <ChatSideBar
            chatRoomId={chatRoomId}
            setChatRoomId={setChatRoomId}
            setCurrentUser={setCurrentUser}
          />
        </div>
        <div className="col-start-5 col-end-13 grid grid-rows-12 max-h-full">
          {chatRoomId !== "" ? (
            <ChatBox chatRoomId={chatRoomId} currentUser={currentUser} />
          ) : (
            <div className="flex flex-col justify-center items-center mt-28">
              <Image src={message} width={400} height={400} alt="back" />
              <button
                className="bg-black p-3 px-4 rounded-md text-white"
                style={{
                  marginTop: "-50px",
                }}
              >
                Start Messaging
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
export default ChatRoom;

const ChatBox = ({ chatRoomId, currentUser }) => {
  const [files, setFiles] = useState([]);
  const handleFileChange = (event) => {
    setFiles([...files, ...event.target.files]);
  };
  const roomRef: any = doc(db, "chatRoom", chatRoomId);
  const [chatRoomMappingId, setChatRoomMappingId] = useState("");
  const [oppUserId, setOppUserId] = useState("");
  const [user] = useAuthState(auth);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const [imageUploader, setImageUploader] = useState(false);
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
          console.log(doc.data().userIds);
          const oppositeUserId: any = doc
            .data()
            .userIds.filter((id) => id !== user.uid)[0];
          console.log("oppsoUser", oppositeUserId);
          setOppUserId(oppositeUserId);
        });
      };
      fetchMappingId();
    }
  }, [user]);
  const uploadImages = async () => {
    const uploadPromises = files.map((image) => {
      const storageRef = ref(
        storage,
        `images/${image.lastModified}-${image.name}`
      );
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
    if (newMessage === "") {
      return;
    }
    await setDoc(
      doc(db, "chatRoomMapping", chatRoomMappingId),
      {
        timestamp: new Date().getTime(),
      },
      { merge: true }
    );
    await addDoc(collection(roomRef, "messages"), {
      message: newMessage,
      userId: user.uid,
      type: "text",
      photoURL: user.photoURL,
      timestamp: new Date().getTime(),
    });
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
      await addDoc(collection(roomRef, "messages"), {
        message: downloadURLs,
        userId: user.uid,
        type: "image",
        photoURL: user.photoURL,
        timestamp: new Date().getTime(),
      });
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
        <Image
          src={currentUser?.photoURL}
          width={40}
          height={40}
          alt=""
          className="mx-3 rounded-full"
        />
        <p className="text-white text-sm font-sans font-semibold">
          {currentUser?.userName}
        </p>
      </div>
      {imageUploader === false ? (
        <div className="row-start-2 row-end-12 min-w-full p-3 w-full overflow-x-hidden overflow-y-scroll no-scrollbar max-h-140 bg-gray-100">
          <div
            style={{
              backgroundImage: `url(${backImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              height: "100%",
              width: "100%",
            }}
          >
            {" "}
            <Messages roomId={chatRoomId} />
          </div>
        </div>
      ) : (
        <></>
      )}
      {imageUploader === false ? (
        <div className="row-start-12 row-end-13 flex flex-row items-center w-full justify-between">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="border-black p-2 rounded-md ml-2"
            placeholder="Type a message..."
            style={{
              border: "1px solid black",
              width: "80%",
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
            className="text-white bg-black p-2 px-4 rounded-md flex flex-row items-center text-sm font-sans font-bold"
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
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
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
