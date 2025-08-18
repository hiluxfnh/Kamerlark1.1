import { addDoc, collection, getDocs, query, setDoc, where, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/Config";

const ChatRoomHandler = async ({ userId1, userId2 }) => {
    const chatRoomMappingRef = collection(db, 'chatRoomMapping');
    const chatRoomRef = collection(db, 'chatRoom');
    // Deterministic pair id
    const [a, b] = [userId1, userId2].sort();
    const pairId = `${a}_${b}`;

    // Try direct doc by pairId to avoid array-contains scan if schema supports it
    const pairDocRef = doc(db, 'chatRoomMapping', pairId);
    const pairDoc = await getDoc(pairDocRef);
    if (pairDoc.exists()) {
        await setDoc(pairDocRef, { timestamp: serverTimestamp() }, { merge: true });
        return pairDoc.data().roomId;
    }

    // Fallback: minimal scan for userId1, then filter by userId2
    const q = query(chatRoomMappingRef, where("userIds", "array-contains", userId1));
    const data = await getDocs(q);
    const filtered = data.docs.find(d => (d.data().userIds || []).includes(userId2));
    if (filtered) {
        await setDoc(filtered.ref, { timestamp: serverTimestamp() }, { merge: true });
        return filtered.data().roomId;
    }

    // Create new room + mapping (also write pairId doc for fast future lookup)
    const chatRoomDoc = await addDoc(chatRoomRef, { createdAt: serverTimestamp(), userIds: [userId1, userId2] });
    const roomId = chatRoomDoc.id;
    await addDoc(chatRoomMappingRef, { roomId, userIds: [userId1, userId2], timestamp: serverTimestamp() });
    await setDoc(pairDocRef, { roomId, userIds: [userId1, userId2], timestamp: serverTimestamp() }, { merge: true });
    return roomId || null;
}

export default ChatRoomHandler;
