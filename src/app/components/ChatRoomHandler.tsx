import { addDoc, collection, getDocs, query, setDoc, where, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/Config";

const ChatRoomHandler = async ({ userId1, userId2 }) => {
    const chatRoomMappingRef = collection(db, 'chatRoomMapping');
    const chatRoomRef = collection(db, 'chatRoom');
    // Deterministic pair id — a single, stable mapping doc per user pair.
    const [a, b] = [userId1, userId2].sort();
    const pairId = `${a}_${b}`;
    const pairDocRef = doc(db, 'chatRoomMapping', pairId);

    // Fast path: the deterministic pair doc already exists.
    // getDoc on a non-existent doc can be denied by rules when resource==null,
    // so we catch that and fall through to the query.
    try {
        const pairDoc = await getDoc(pairDocRef);
        if (pairDoc.exists() && pairDoc.data().roomId) {
            await setDoc(pairDocRef, { timestamp: serverTimestamp() }, { merge: true });
            return pairDoc.data().roomId;
        }
    } catch (_) {
        // permission denied on non-existent doc — fall through to query
    }

    // Fallback: find any legacy mapping for this pair (older data may have
    // used random-id mapping docs). Reuse its roomId so we don't create a
    // duplicate conversation.
    const q = query(chatRoomMappingRef, where("userIds", "array-contains", userId1));
    const data = await getDocs(q);
    const filtered = data.docs.find(d => (d.data().userIds || []).includes(userId2));
    if (filtered && filtered.data().roomId) {
        const existingRoomId = filtered.data().roomId;
        // Heal forward: ensure the deterministic pair doc points at the same
        // room so future lookups are O(1) and no further duplicates appear.
        try {
            await setDoc(
                pairDocRef,
                { roomId: existingRoomId, userIds: [userId1, userId2], timestamp: serverTimestamp() },
                { merge: true }
            );
        } catch {}
        return existingRoomId;
    }

    // Create a new room and exactly ONE mapping (the deterministic pair doc).
    const chatRoomDoc = await addDoc(chatRoomRef, { createdAt: serverTimestamp(), userIds: [userId1, userId2] });
    const roomId = chatRoomDoc.id;
    await setDoc(
        pairDocRef,
        { roomId, userIds: [userId1, userId2], timestamp: serverTimestamp() },
        { merge: true }
    );
    return roomId || null;
}

export default ChatRoomHandler;
