"use client";
import { useEffect, useState } from "react";
import React from "react";
import { auth, db } from "../firebase/Config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
const Tetsing = () => {
    const [user]=useAuthState(auth);
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const handleCreateRoom = async() => {
        if(!userId) {
            router.push('/login');
            return;
        }
        const chatRoomMappingRef= collection(db, 'chatRoomMapping');
        const chatRoomRef= collection(db, 'chatRoom');
        const chatRoomDoc=await addDoc(chatRoomRef, {});
        const roomId=chatRoomDoc.id;

        await addDoc(chatRoomMappingRef, {
            roomId,
            userIds:[user.uid, userId]
        });
        alert('Room created successfully');
        
    }  
    return (
        <div>
            <input type="text" placeholder="Enter user id" value={userId} onChange={(e)=>setUserId(e.target.value)}/>
            <button onClick={handleCreateRoom}>Submit</button>
        </div>
    );
};
export default Tetsing;