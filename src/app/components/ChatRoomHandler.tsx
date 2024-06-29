import { addDoc, collection, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebase/Config";

const ChatRoomHandler = async ({ userId1, userId2 }) => {
    const chatRoomMappingRef = collection(db, 'chatRoomMapping');
    const chatRoomRef = collection(db, 'chatRoom');

    // Query for documents where userIds contains userId1
    const q = query(chatRoomMappingRef, where("userIds", "array-contains", userId1));
    const data = await getDocs(q);

    console.log("data.docs", data.docs);

    // Filter the results to find a document that also contains userId2
    const filteredDocs = data.docs.filter(doc => doc.data().userIds.includes(userId2));

    if (filteredDocs.length > 0) {
        await setDoc(filteredDocs[0].ref, {
            timestamp: new Date().getTime()
        }, { merge: true });
        return filteredDocs[0].data().roomId;
    }

    if (filteredDocs.length === 0) {
        const chatRoomDoc = await addDoc(chatRoomRef, {});
        const roomId = chatRoomDoc.id;

        await addDoc(chatRoomMappingRef, {
            roomId,
            userIds: [userId1, userId2],
            timestamp: new Date().getTime()
        });

        if (roomId) {
            return roomId;
        } else {
            return null;
        }
    }
}

export default ChatRoomHandler;
