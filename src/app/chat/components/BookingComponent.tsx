import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase/Config";
import { useEffect, useState } from "react";
import CustomerBookings from "../../profile/Components/CustomerBookings";
import RentedPropertiesCard from "../../profile/Components/RentedPropertiesCard";
import { useAuthState } from "react-firebase-hooks/auth";

const BookingComponent = ({ message }) => {
    const bookingId = message.bookingId;
    const [user] = useAuthState(auth);
    const bookingRef = doc(db, "bookings", bookingId);
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(bookingRef, async (bookingDoc) => {
            if (bookingDoc.exists()) {
                const roomRef = doc(db, "roomdetails", bookingDoc.data().roomId);
                const roomDoc = await getDoc(roomRef);
                if (roomDoc.exists()) {
                    setBooking({
                        id: bookingDoc.id,
                        ...bookingDoc.data(),
                        roomDetails: roomDoc.data()
                    });
                }
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        console.log(booking);
    }, [booking]);

    if (!booking) {
        return <div>Loading...</div>;
    }

    return (
        <div className="">
            {
                user.uid === message.userId ? (
                    <RentedPropertiesCard listing={booking} refresher={() => { }} fromChat={true} />
                ) : (
                    <CustomerBookings listing={booking} refresher={() => { }} fromChat={true} />
                )
            }
        </div>
    );
};

export default BookingComponent;
