import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebase/Config";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ChatSideBar = ({chatRoomId,setChatRoomId,setCurrentUser}) => {
    const [user]=useAuthState(auth);
    const [chatRooms,setChatRooms]=useState([]);
        useEffect(() => {
        const fetch=async()=>{
            if(user){
                console.log("user curr",user.uid);
                const docRef=collection(db,"chatRoomMapping");
                const q= query(docRef,(
                    where("userIds", "array-contains", user.uid),
                    orderBy("timestamp","desc")
                ));
                let data :any =await getDocs(q);
                const filteredData=data.docs.filter((doc)=>doc.data().userIds.includes(user.uid));
                console.log("filtered data",filteredData);
                data=filteredData;
                const chatRooms=[];
                await Promise.all(data.map(async(room)=>{
                    const oppositeUserId=room.data().userIds.find((id)=>id!==user.uid);
                    const userRef=doc(db,"Users",oppositeUserId);
                    const userSnap=await getDoc(userRef);
                    const oppositeUser=userSnap.data();
                    let time :any =new Date(room.data().timestamp);
                    time=time.toLocaleString();
                    chatRooms.push({
                        id:room.id,
                        user:oppositeUser,
                        ...room.data(),
                        date:time.split(',')[0],
                        time:time.split(',')[1]
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
            <h1 className="text-xl font-sans font-semibold px-3 py-3 pb-4 bg-black text-white">KAMERLARK CHAT</h1>
            {
                chatRooms.map((room)=>(
                    <button className="flex flex-row items-center justify-between border-b-2 p-2 cursor-pointer min-w-full max-w-full" onClick={
                        ()=>{
                            setChatRoomId(room.roomId);
                            setCurrentUser(room.user);
                        }
                    } key={room.id}>
                        <div className="flex flex-row items-center"><Image src={room.user.photoURL} alt="profile" width={40} height={40} className="rounded-full mx-2"/>
                        <div className="flex flex-col items-start"><p className="font-sans font-semibold" style={{
                            textAlign:'left'
                        }}>{room.user.userName}</p>
                        <div className="flex flex-row items-center"><LocationOnIcon className="text-gray-500 text-sm" fontSize="small"/>
                        <p className="text-gray-500 text-sm font-sans">Not updated</p>
                        </div>
                        </div>
                        </div>
                        <div>
                            <p>{room?.time?.split(':')[0]}:{room?.time?.split(':')[1]}</p>
                        </div>
                    </button>
                ))
            }
        </div>
    );
};
export default ChatSideBar;