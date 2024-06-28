import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/Config";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ChatSideBar = () => {
    const [user]=useAuthState(auth);
    const [chatRooms,setChatRooms]=useState([]);
    const router=useRouter();
    useEffect(() => {
        const fetch=async()=>{
            if(user){
                console.log("user",user);
                const docRef=collection(db,"chatRoomMapping");
                const q= query(docRef,(
                    where("userIds","array-contains",user.uid),
                    orderBy("timestamp","desc")
                ));
                const data=await getDocs(q);
                console.log("docs",data.docs);
                const chatRooms=[];
                await Promise.all(data.docs.map(async(room)=>{
                    const oppositeUserId=room.data().userIds.find((id)=>id!==user.uid);
                    const userRef=doc(db,"Users",oppositeUserId);
                    const userSnap=await getDoc(userRef);
                    const oppositeUser=userSnap.data();
                    chatRooms.push({
                        id:room.id,
                        user:oppositeUser,
                        ...room.data(),
                    });
                }));
                setChatRooms(chatRooms);
            }
        }
        fetch();
    }, [user]);
    useEffect(() => {
        console.log(chatRooms);
    }, [chatRooms]);
    return (
        <div>
            <h1 className="text-xl font-sans font-semibold px-3 my-3">KAMERLARK CHAT</h1>
            {
                chatRooms.map((room)=>(
                    <button className="flex flex-row items-center justify-between border-b-2 p-2 bg-gray-100 cursor-pointer min-w-full max-w-full" onClick={
                        ()=>{
                            router.push(`/chat/${room.roomId}`);
                        }
                    } key={room.id}>
                        <div className="flex flex-row items-center"><Image src={room.user.photoURL} alt="profile" width={40} height={40} className="rounded-full mx-2"/>
                        <p>{room.user.userName}</p>
                        </div>
                    </button>
                ))
            }
        </div>
    );
};
export default ChatSideBar;